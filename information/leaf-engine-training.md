# Leaf Engine — Fine-tuning Guide

> Hướng dẫn train Qwen2.5-7B để phân tách note thành leaves bằng synthetic data pipeline (Teacher→Student distillation).

---

## Tổng quan pipeline

```
Claude Opus / GPT-4o  ←── Teacher (strong, đắt)
        │ generate notes + split
        ▼
  [synthetic dataset]
        │ auto-evaluate + filter
        ▼
  training data sạch (~5000 examples)
        │ fine-tune LoRA
        ▼
  Qwen2.5-7B-Instruct  ←── Student (nhỏ, rẻ, production)
        │ deploy
        ▼
  Together AI / self-hosted
```

Chi phí ước tính toàn bộ pipeline: **~$10**.

---

## Bước 1 — Sinh training data

### 1.1 Cấu trúc một example

```jsonl
{"messages": [
  {"role": "system", "content": "Bạn là Leaf Engine..."},
  {"role": "user", "content": "## Note\n\n[nội dung note]"},
  {"role": "assistant", "content": "[{\"content\": \"...\", \"type\": \"concept\"}]"}
]}
```

### 1.2 Script sinh data

```python
# scripts/generate_data.py
import anthropic
import json, random

client = anthropic.Anthropic()  # ANTHROPIC_API_KEY

SYSTEM_TEACHER = """Bạn là Leaf Engine — hệ thống phân tách ghi chú thành các "leaf" (đơn vị kiến thức nguyên tử).

Quy tắc:
- Mỗi leaf = 1 ý duy nhất, độc lập, có thể review riêng lẻ
- Giữ nguyên ngôn ngữ gốc (Vi/En)
- type: concept | fact | task | question | example
- Không ghép 2 ý vào 1 leaf
- Không bỏ sót thông tin quan trọng

Output JSON array, không giải thích thêm."""

TOPICS = [
    "lập trình Python", "machine learning cơ bản", "quản lý thời gian",
    "đọc sách hiệu quả", "ReactJS hooks", "SQL optimization",
    "thiền định", "học ngoại ngữ", "tài chính cá nhân", "Docker & containers",
    "viết technical blog", "system design", "git workflow", "REST API design",
]

LENGTHS = ["ngắn (3-5 câu)", "trung bình (8-12 câu)", "dài (15-20 câu)"]
LANGS = ["tiếng Việt", "tiếng Anh", "mix Việt-Anh (code-switching)"]

def generate_note(topic, length, lang):
    """Dùng Claude Haiku sinh note giả (rẻ hơn)."""
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        messages=[{"role": "user", "content":
            f"Viết 1 ghi chú học tập về '{topic}', độ dài {length}, bằng {lang}. "
            f"Phong cách: ghi chú cá nhân, tự nhiên, có thể bullet points hoặc prose. "
            f"Chỉ trả về nội dung ghi chú, không giải thích."
        }]
    )
    return resp.content[0].text

def split_note(note_text):
    """Dùng Claude Opus làm teacher split (chất lượng cao nhất)."""
    resp = client.messages.create(
        model="claude-opus-4-7",  # teacher mạnh nhất
        max_tokens=1500,
        system=SYSTEM_TEACHER,
        messages=[{"role": "user", "content": f"## Note\n\n{note_text}"}]
    )
    return resp.content[0].text

def build_example(note_text, leaves_json):
    return {"messages": [
        {"role": "system", "content": SYSTEM_TEACHER},
        {"role": "user", "content": f"## Note\n\n{note_text}"},
        {"role": "assistant", "content": leaves_json},
    ]}

def main(n=5000, output="data/raw.jsonl"):
    examples = []
    for i in range(n):
        topic  = random.choice(TOPICS)
        length = random.choice(LENGTHS)
        lang   = random.choice(LANGS)

        note   = generate_note(topic, length, lang)
        leaves = split_note(note)

        examples.append(build_example(note, leaves))

        if (i + 1) % 100 == 0:
            print(f"Generated {i+1}/{n}")

    with open(output, "w", encoding="utf-8") as f:
        for ex in examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

if __name__ == "__main__":
    main()
```

Chi phí sinh 5000 examples:
- Note generation (Haiku): ~$0.5
- Leaf splitting (Opus): ~$2.0

---

## Bước 2 — Auto-evaluate & filter

```python
# scripts/evaluate_data.py
import json, re
from sentence_transformers import SentenceTransformer, util
import anthropic

client = anthropic.Anthropic()
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

def score_example(note: str, leaves_raw: str) -> dict:
    scores = {}

    # 1. JSON valid
    try:
        leaves = json.loads(leaves_raw)
        scores["json_valid"] = 1.0
    except Exception:
        return {"total": 0.0, "reason": "invalid_json"}

    # 2. Coverage — leaves ghép lại phải cover note gốc
    combined = " ".join(l["content"] for l in leaves)
    note_words = set(note.lower().split())
    combined_words = set(combined.lower().split())
    scores["coverage"] = len(note_words & combined_words) / max(len(note_words), 1)

    # 3. Atomicity — mỗi leaf không quá 60 words
    avg_len = sum(len(l["content"].split()) for l in leaves) / max(len(leaves), 1)
    scores["atomicity"] = 1.0 if avg_len <= 60 else 60 / avg_len

    # 4. No duplicate — cosine similarity giữa các leaf
    if len(leaves) > 1:
        embeddings = embedder.encode([l["content"] for l in leaves])
        sims = util.cos_sim(embeddings, embeddings)
        # Lấy max similarity (ngoài diagonal)
        max_sim = 0.0
        for i in range(len(leaves)):
            for j in range(i+1, len(leaves)):
                max_sim = max(max_sim, sims[i][j].item())
        scores["no_duplicate"] = 1.0 - max_sim
    else:
        scores["no_duplicate"] = 1.0

    # 5. Type valid
    valid_types = {"concept", "fact", "task", "question", "example"}
    all_valid = all(l.get("type") in valid_types for l in leaves)
    scores["type_valid"] = 1.0 if all_valid else 0.5

    # Tổng điểm (có trọng số)
    total = (
        scores["json_valid"]    * 0.20 +
        scores["coverage"]      * 0.35 +
        scores["atomicity"]     * 0.20 +
        scores["no_duplicate"]  * 0.15 +
        scores["type_valid"]    * 0.10
    )
    scores["total"] = total
    return scores

def filter_dataset(input_file="data/raw.jsonl", output_file="data/train.jsonl", threshold=0.75):
    kept, dropped = 0, 0
    with open(input_file, encoding="utf-8") as fin, \
         open(output_file, "w", encoding="utf-8") as fout:
        for line in fin:
            ex = json.loads(line)
            note   = ex["messages"][1]["content"].replace("## Note\n\n", "")
            leaves = ex["messages"][2]["content"]
            scores = score_example(note, leaves)
            if scores.get("total", 0) >= threshold:
                fout.write(json.dumps(ex, ensure_ascii=False) + "\n")
                kept += 1
            else:
                dropped += 1
    print(f"Kept: {kept} | Dropped: {dropped} | Rate: {kept/(kept+dropped):.1%}")

if __name__ == "__main__":
    filter_dataset()
```

Kỳ vọng: giữ ~75-85% examples sau filter.

---

## Bước 3 — Fine-tune Qwen2.5-7B

### 3.1 Setup môi trường (RunPod — A100 40GB, ~$2/h)

```bash
pip install unsloth transformers datasets trl peft
```

### 3.2 Training script

```python
# scripts/train.py
from unsloth import FastLanguageModel
from trl import SFTTrainer, SFTConfig
from datasets import load_dataset
import torch

MODEL_NAME = "Qwen/Qwen2.5-7B-Instruct"
MAX_SEQ_LEN = 2048

# Load model với 4-bit quantization (giảm VRAM)
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LEN,
    dtype=torch.bfloat16,
    load_in_4bit=True,
)

# Gắn LoRA adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,                    # rank — tăng lên nếu task phức tạp
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    use_gradient_checkpointing=True,
)

# Load dataset
dataset = load_dataset("json", data_files={
    "train": "data/train.jsonl",
    "test":  "data/test.jsonl",   # tách 10% ra test trước
})

def format_example(example):
    """Apply chat template của Qwen."""
    return {"text": tokenizer.apply_chat_template(
        example["messages"],
        tokenize=False,
        add_generation_prompt=False,
    )}

dataset = dataset.map(format_example)

# Train
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    args=SFTConfig(
        output_dir="./output",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        logging_steps=50,
        eval_steps=200,
        save_steps=500,
        bf16=True,
        dataset_text_field="text",
        max_seq_length=MAX_SEQ_LEN,
        report_to="none",
    ),
)

trainer.train()

# Lưu LoRA weights
model.save_pretrained("./output/lora-final")
tokenizer.save_pretrained("./output/lora-final")

# Merge + export (để deploy)
model.save_pretrained_merged("./output/merged", tokenizer, save_method="merged_16bit")
```

Thời gian train: **3-4 giờ** trên A100 với 4000 examples.

---

## Bước 4 — Deploy trên Together AI

```bash
# Upload model lên HuggingFace Hub trước
pip install huggingface_hub
huggingface-cli upload YOUR_USERNAME/leafnote-leaf-engine ./output/merged

# Deploy trên Together AI (fine-tune endpoint)
# Vào together.ai → Fine-tuning → Upload model → Deploy
# Chi phí: ~$0.20/1M tokens (Qwen2.5-7B)
```

### Gọi từ Leafnote backend

```python
# backend/app/services/leaf_engine.py
from together import Together

client = Together()  # TOGETHER_API_KEY

SYSTEM_PROMPT = """Bạn là Leaf Engine..."""  # giống teacher

async def split_note(note_content: str) -> list[dict]:
    resp = client.chat.completions.create(
        model="YOUR_USERNAME/leafnote-leaf-engine",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"## Note\n\n{note_content}"},
        ],
        temperature=0.1,   # thấp để output ổn định
        max_tokens=1500,
    )
    import json
    return json.loads(resp.choices[0].message.content)
```

---

## Chi phí tổng kết

| Bước | Chi phí |
|---|---|
| Sinh 5000 notes (Haiku) | ~$0.50 |
| Split bằng Opus teacher | ~$2.00 |
| Evaluate (CPU, miễn phí) | $0 |
| Train A100 4h (RunPod) | ~$8.00 |
| **Tổng** | **~$10.50** |

Inference sau khi deploy:
- Together AI Qwen2.5-7B: ~$0.20/1M tokens
- Mỗi note split: ~500-800 tokens → **~$0.0001/note**

---

## Thứ tự thực hiện

```
[ ] 1. Viết SYSTEM_PROMPT chính thức cho Leaf Engine
[ ] 2. Chạy generate_data.py (bắt đầu 500 examples để test pipeline)
[ ] 3. Chạy evaluate_data.py — kiểm tra tỉ lệ filter
[ ] 4. Nếu tỉ lệ OK → sinh đủ 5000
[ ] 5. Thuê RunPod A100 → chạy train.py
[ ] 6. Evaluate model trên test set (20 notes tay)
[ ] 7. Deploy lên Together AI
[ ] 8. Tích hợp leaf_engine.py vào Note API
```

---

## Tham khảo

- [Unsloth docs](https://github.com/unslothai/unsloth) — fine-tune nhanh nhất hiện tại
- [Together AI fine-tuning](https://docs.together.ai/docs/fine-tuning-overview)
- [Qwen2.5 model card](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [TRL SFTTrainer](https://huggingface.co/docs/trl/sft_trainer)
