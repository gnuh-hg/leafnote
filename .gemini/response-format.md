# Response Format — Gemini Workers

> Chuẩn output bắt buộc cho tất cả Gemini Workers. Định dạng thống nhất giúp Orchestrator parse và Claude review nhanh hơn.

Mọi worker response phải theo cấu trúc sau:

---

## Summary

[1-2 câu: đã làm gì, tại sao.]

## Files Changed

- `path/to/file.ext` — [lý do thay đổi]
- `path/to/another.ext` — [lý do thay đổi]

## Code

[Mỗi file là một code block riêng với đường dẫn đầy đủ. LUÔN viết full file content — không dùng `// ... unchanged` hay tóm tắt.]

```typescript
// frontend/src/components/ExampleComponent.tsx
[full content]
```

```python
# backend/app/services/example.py
[full content]
```

## Notes

[Các điểm cần Orchestrator hoặc Claude chú ý: assumption đã đặt ra, caveat kỹ thuật, phần cần review thêm, dependency chưa install, v.v. Bỏ qua mục này nếu không có gì đặc biệt.]
