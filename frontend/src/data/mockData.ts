// Mock data for Leafnote frontend. Vietnamese content for visualization purposes.

// --- Types ---

export interface Tag {
  id: string
  name: string
  dot: string
  noteCount: number
}

export interface Project {
  id: string
  name: string
  dot: string
  leafCount: number
  noteCount: number
  heat: number
}

export interface Note {
  id: string
  title: string
  projectId: string
  tagIds: string[]
  updatedAt: string
  leafCount: number
  excerpt: string
}

export type LeafType = 'definition' | 'proposition' | 'relation' | 'fact'
export type SurfacingType = 'forgetting' | 'related' | 'conflict' | 'new'

export interface QuestionItem {
  type: 'cloze' | 'definition-reverse' | 'application'
  q: string
  a: string
}

export interface Leaf {
  id: string
  content: string
  type: LeafType
  sourceNoteId: string
  sourceNoteTitle: string
  projectId: string
  retention: number
  relevance: number
  surfacingType?: SurfacingType
  surfacingReason?: string
  lastReviewedAt: string
  nextReviewAt?: string
  reviewCount: number
  createdAt: string
  sourceSpan?: string
  questions?: QuestionItem[]
  linkedLeaves: string[]
  dormant?: boolean
}

export interface BodySegment {
  text: string
  italic?: boolean
  leafId?: string
  leafType?: LeafType
}

export interface BodyBlock {
  type: 'p'
  segments: BodySegment[]
}

export interface DetectedLeaf {
  id: string
  content: string
  type: LeafType
  confidence: number
  status: 'existing' | 'new' | 'linked'
}

export interface Insight {
  kind: 'related' | 'gap' | 'conflict'
  text: string
}

export interface DecompositionDemo {
  noteId: string
  title: string
  body: BodyBlock[]
  detectedLeaves: DetectedLeaf[]
  insights: Insight[]
}

export interface ForgettingCurvePoint {
  day: number
  user: number
  fsrs: number
}

export interface TopicHeatmapItem {
  project: string
  weeks: number[]
}

export interface CognitiveTrait {
  label: string
  value: string
  detail: string
}

export interface CognitiveProfile {
  traits: CognitiveTrait[]
  streak: number
  totalLeaves: number
  totalReviews: number
  avgRetention: number
}

export interface TodayStats {
  needReview: number
  reviewed: number
  newLeaves: number
  studyMinutes: number
  streakDays: number
}

export interface Conflict {
  id: string
  severity: 'low' | 'medium' | 'high'
  leaves: string[]
  summary: string
  detail: string
}

export interface GraphNode {
  id: string
  x: number
  y: number
  r: number
  content: string
  cluster: string
  retention: number
}

export interface GraphEdge {
  from: string
  to: string
  strength: number
  crossCluster?: boolean
}

// --- Data ---

export const tags: Tag[] = [
  { id: 't1', name: 'triết-học', dot: 'bg-amber-400', noteCount: 3 },
  { id: 't2', name: 'fsrs', dot: 'bg-indigo-400', noteCount: 2 },
  { id: 't3', name: 'nlp', dot: 'bg-sky-400', noteCount: 1 },
  { id: 't4', name: 'sinh-học', dot: 'bg-emerald-400', noteCount: 1 },
  { id: 't5', name: 'lịch-sử', dot: 'bg-rose-400', noteCount: 1 },
  { id: 't6', name: 'paradigm', dot: 'bg-violet-400', noteCount: 2 },
  { id: 't7', name: 'reading', dot: 'bg-teal-400', noteCount: 4 },
]

// Giữ projects cho KnowledgeGraph (cluster visualization) — không dùng làm metadata cho note
export const projects: Project[] = [
  { id: 'p1', name: 'Triết học khoa học', dot: 'bg-amber-400', leafCount: 47, noteCount: 8, heat: 0.92 },
  { id: 'p2', name: 'Spaced repetition & FSRS', dot: 'bg-indigo-400', leafCount: 35, noteCount: 5, heat: 0.78 },
  { id: 'p3', name: 'NLP & embedding', dot: 'bg-sky-400', leafCount: 28, noteCount: 4, heat: 0.55 },
  { id: 'p4', name: 'Sinh học phân tử', dot: 'bg-emerald-400', leafCount: 18, noteCount: 3, heat: 0.34 },
  { id: 'p5', name: 'Lịch sử VN cận đại', dot: 'bg-rose-400', leafCount: 14, noteCount: 2, heat: 0.18 },
]

export const notes: Note[] = [
  {
    id: 'n1',
    title: 'Popper và falsificationism',
    projectId: 'p1',
    tagIds: ['t1', 't7'],
    updatedAt: '3 giờ trước',
    leafCount: 5,
    excerpt: 'Karl Popper bác bỏ inductivism của Vienna Circle, đề xuất tiêu chí phân biệt khoa học là khả năng bị bác bỏ.',
  },
  {
    id: 'n2',
    title: 'Kuhn — Paradigm shift và khoa học cách mạng',
    projectId: 'p1',
    tagIds: ['t1', 't6', 't7'],
    updatedAt: 'hôm qua',
    leafCount: 6,
    excerpt: 'Khoa học không tiến hoá tuyến tính mà qua các giai đoạn normal science → crisis → revolution.',
  },
  {
    id: 'n3',
    title: 'Lakatos — Research programmes',
    projectId: 'p1',
    tagIds: ['t1', 't6'],
    updatedAt: '4 ngày trước',
    leafCount: 4,
    excerpt: 'Lakatos kết hợp Popper và Kuhn, đề xuất hard core và protective belt.',
  },
  {
    id: 'n4',
    title: 'FSRS — Three-component model',
    projectId: 'p2',
    tagIds: ['t2', 't7'],
    updatedAt: '6 giờ trước',
    leafCount: 5,
    excerpt: 'Mô hình ghi nhớ dựa trên difficulty, stability, retrievability.',
  },
  {
    id: 'n5',
    title: 'So sánh SM-2 và FSRS',
    projectId: 'p2',
    tagIds: ['t2'],
    updatedAt: '2 ngày trước',
    leafCount: 3,
    excerpt: 'SM-2 dùng ease factor đơn giản, FSRS fit tham số per-user qua MLE.',
  },
  {
    id: 'n6',
    title: 'Embedding ngữ nghĩa và RAG',
    projectId: 'p3',
    tagIds: ['t3', 't7'],
    updatedAt: 'hôm qua',
    leafCount: 5,
    excerpt: 'Vector embedding cho phép retrieval theo ngữ nghĩa thay vì keyword.',
  },
  {
    id: 'n7',
    title: 'CRISPR-Cas9 — Cơ chế cắt DNA',
    projectId: 'p4',
    tagIds: ['t4'],
    updatedAt: '5 ngày trước',
    leafCount: 4,
    excerpt: 'Hệ thống dùng guide RNA định vị target sequence trên DNA.',
  },
  {
    id: 'n8',
    title: 'Phong trào Cần Vương',
    projectId: 'p5',
    tagIds: ['t5'],
    updatedAt: '1 tuần trước',
    leafCount: 3,
    excerpt: 'Khởi nguồn từ chiếu Cần Vương 1885 của vua Hàm Nghi.',
  },
]

export const leaves: Leaf[] = [
  // Project 1: Triết học khoa học
  {
    id: 'a1',
    content: 'Falsifiability là tiêu chí phân biệt khoa học với phi-khoa học, không phải verifiability.',
    type: 'definition',
    sourceNoteId: 'n1',
    sourceNoteTitle: 'Popper và falsificationism',
    projectId: 'p1',
    retention: 0.78,
    relevance: 0.94,
    surfacingType: 'related',
    surfacingReason: 'Bạn đang viết note "Kuhn — Paradigm shift", lá này được tham chiếu',
    lastReviewedAt: '3 ngày trước',
    nextReviewAt: 'hôm nay',
    reviewCount: 12,
    createdAt: '2 tháng trước',
    sourceSpan: 'falsifiability',
    questions: [
      { type: 'cloze', q: 'Theo Popper, tiêu chí phân biệt khoa học với phi-khoa học là ___', a: 'falsifiability' },
      { type: 'definition-reverse', q: 'Khái niệm nào yêu cầu lý thuyết khoa học phải có khả năng bị thực nghiệm bác bỏ?', a: 'Falsifiability' },
      { type: 'application', q: 'Một lý thuyết "không thể sai trong mọi tình huống" có phải là lý thuyết khoa học theo Popper không?', a: 'Không — vì không thể bị bác bỏ.' },
    ],
    linkedLeaves: ['a2', 'a4', 'a7'],
  },
  {
    id: 'a2',
    content: 'Kuhn cho rằng khoa học tiến hoá qua các paradigm shift, không phải tích lũy tuyến tính.',
    type: 'proposition',
    sourceNoteId: 'n2',
    sourceNoteTitle: 'Kuhn — Paradigm shift',
    projectId: 'p1',
    retention: 0.65,
    relevance: 0.88,
    surfacingType: 'forgetting',
    surfacingReason: 'Sắp đạt ngưỡng quên (retention < 70%) — đường cong cá nhân của bạn dốc hơn trung bình',
    lastReviewedAt: '8 ngày trước',
    nextReviewAt: 'hôm nay',
    reviewCount: 7,
    createdAt: '1 tháng trước',
    sourceSpan: 'paradigm shift',
    questions: [
      { type: 'cloze', q: 'Theo Kuhn, khoa học tiến hoá qua các ___ thay vì tích lũy tuyến tính.', a: 'paradigm shift' },
    ],
    linkedLeaves: ['a3', 'a4'],
  },
  {
    id: 'a3',
    content: 'Normal science vận hành trong khuôn khổ paradigm; khi các anomaly tích tụ đủ lớn, crisis xảy ra dẫn tới revolution.',
    type: 'relation',
    sourceNoteId: 'n2',
    sourceNoteTitle: 'Kuhn — Paradigm shift',
    projectId: 'p1',
    retention: 0.72,
    relevance: 0.85,
    surfacingType: 'related',
    surfacingReason: 'Cùng cụm khái niệm với lá bạn vừa mở',
    lastReviewedAt: '5 ngày trước',
    reviewCount: 5,
    createdAt: '1 tháng trước',
    linkedLeaves: ['a2'],
  },
  {
    id: 'a4',
    content: 'Lakatos đề xuất research programmes thay vì lý thuyết đơn lẻ; mỗi programme có hard core bất biến và protective belt điều chỉnh được.',
    type: 'definition',
    sourceNoteId: 'n3',
    sourceNoteTitle: 'Lakatos — Research programmes',
    projectId: 'p1',
    retention: 0.45,
    relevance: 0.62,
    surfacingType: 'forgetting',
    surfacingReason: 'Đã 12 ngày không gặp lại — retention dự đoán 45%',
    lastReviewedAt: '12 ngày trước',
    nextReviewAt: 'quá hạn 2 ngày',
    reviewCount: 3,
    createdAt: '1 tháng trước',
    linkedLeaves: ['a1', 'a2'],
  },
  {
    id: 'a5',
    content: 'Duhem-Quine thesis: ta không bao giờ test một giả thuyết đơn lẻ, mà luôn test cả mạng lưới giả thuyết phụ trợ.',
    type: 'proposition',
    sourceNoteId: 'n1',
    sourceNoteTitle: 'Popper và falsificationism',
    projectId: 'p1',
    retention: 0.83,
    relevance: 0.71,
    surfacingType: 'conflict',
    surfacingReason: 'Mâu thuẫn nhẹ với lá #a1 — gợi ý xem xét lại',
    lastReviewedAt: '4 ngày trước',
    reviewCount: 8,
    createdAt: '2 tháng trước',
    linkedLeaves: ['a1'],
  },
  {
    id: 'a6',
    content: "Bayesian epistemology coi xác suất là độ tin cậy chủ quan, cập nhật qua Bayes' theorem khi có bằng chứng mới.",
    type: 'definition',
    sourceNoteId: 'n1',
    sourceNoteTitle: 'Popper và falsificationism',
    projectId: 'p1',
    retention: 0.69,
    relevance: 0.55,
    lastReviewedAt: '6 ngày trước',
    reviewCount: 4,
    createdAt: '3 tuần trước',
    linkedLeaves: ['a1', 'a5'],
  },
  {
    id: 'a7',
    content: 'Vấn đề quy nạp của Hume: không có cơ sở logic nào để khái quát từ trường hợp cụ thể sang quy luật phổ quát.',
    type: 'proposition',
    sourceNoteId: 'n1',
    sourceNoteTitle: 'Popper và falsificationism',
    projectId: 'p1',
    retention: 0.91,
    relevance: 0.48,
    lastReviewedAt: '2 ngày trước',
    reviewCount: 14,
    createdAt: '3 tháng trước',
    linkedLeaves: ['a1', 'a6'],
  },

  // Project 2: FSRS
  {
    id: 'a8',
    content: 'FSRS dùng three-component model: difficulty, stability, retrievability.',
    type: 'definition',
    sourceNoteId: 'n4',
    sourceNoteTitle: 'FSRS — Three-component model',
    projectId: 'p2',
    retention: 0.88,
    relevance: 0.96,
    surfacingType: 'related',
    surfacingReason: 'Cốt lõi cho engine cá nhân hoá của Leafnote',
    lastReviewedAt: 'hôm qua',
    reviewCount: 18,
    createdAt: '2 tháng trước',
    linkedLeaves: ['a9', 'a10', 'a11'],
  },
  {
    id: 'a9',
    content: 'Stability tăng theo successful recall và giảm khi quên; tốc độ thay đổi phụ thuộc difficulty của lá.',
    type: 'relation',
    sourceNoteId: 'n4',
    sourceNoteTitle: 'FSRS — Three-component model',
    projectId: 'p2',
    retention: 0.74,
    relevance: 0.83,
    lastReviewedAt: '4 ngày trước',
    reviewCount: 6,
    createdAt: '6 tuần trước',
    linkedLeaves: ['a8'],
  },
  {
    id: 'a10',
    content: 'Optimal review interval = stability × ln(target_retention) / ln(0.9).',
    type: 'fact',
    sourceNoteId: 'n4',
    sourceNoteTitle: 'FSRS — Three-component model',
    projectId: 'p2',
    retention: 0.56,
    relevance: 0.79,
    surfacingType: 'forgetting',
    surfacingReason: 'Công thức — bạn thường quên các lá dạng formula nhanh hơn 30%',
    lastReviewedAt: '7 ngày trước',
    nextReviewAt: 'hôm nay',
    reviewCount: 4,
    createdAt: '1 tháng trước',
    linkedLeaves: ['a8'],
  },
  {
    id: 'a11',
    content: 'FSRS-4.5 fit 17 tham số per-user qua maximum likelihood estimation trên lịch sử review của user đó.',
    type: 'definition',
    sourceNoteId: 'n4',
    sourceNoteTitle: 'FSRS — Three-component model',
    projectId: 'p2',
    retention: 0.81,
    relevance: 0.91,
    lastReviewedAt: '3 ngày trước',
    reviewCount: 9,
    createdAt: '1 tháng trước',
    linkedLeaves: ['a8'],
  },
  {
    id: 'a12',
    content: 'SM-2 (thuật toán Anki cũ) đơn giản hơn FSRS nhưng kém chính xác trên dữ liệu lớn vì dùng ease factor cố định.',
    type: 'proposition',
    sourceNoteId: 'n5',
    sourceNoteTitle: 'So sánh SM-2 và FSRS',
    projectId: 'p2',
    retention: 0.68,
    relevance: 0.64,
    lastReviewedAt: '5 ngày trước',
    reviewCount: 5,
    createdAt: '6 tuần trước',
    linkedLeaves: ['a8', 'a11'],
  },

  // Project 3: NLP / embedding
  {
    id: 'a13',
    content: 'Embedding chuyển text thành vector trong không gian ngữ nghĩa cao chiều, gần nhau ngữ nghĩa thì gần nhau trong không gian.',
    type: 'definition',
    sourceNoteId: 'n6',
    sourceNoteTitle: 'Embedding ngữ nghĩa và RAG',
    projectId: 'p3',
    retention: 0.86,
    relevance: 0.93,
    surfacingType: 'new',
    surfacingReason: 'Lá mới sinh từ note bạn vừa lưu',
    lastReviewedAt: 'mới tạo',
    reviewCount: 1,
    createdAt: 'hôm nay',
    linkedLeaves: ['a14', 'a15'],
  },
  {
    id: 'a14',
    content: 'Cosine similarity đo độ gần ngữ nghĩa giữa hai vector embedding, giá trị từ -1 đến 1.',
    type: 'definition',
    sourceNoteId: 'n6',
    sourceNoteTitle: 'Embedding ngữ nghĩa và RAG',
    projectId: 'p3',
    retention: 0.79,
    relevance: 0.87,
    surfacingType: 'new',
    surfacingReason: 'Lá mới sinh từ note bạn vừa lưu',
    lastReviewedAt: 'mới tạo',
    reviewCount: 1,
    createdAt: 'hôm nay',
    linkedLeaves: ['a13'],
  },
  {
    id: 'a15',
    content: 'RAG (Retrieval-Augmented Generation) truy xuất context từ vector store trước khi LLM sinh phản hồi.',
    type: 'definition',
    sourceNoteId: 'n6',
    sourceNoteTitle: 'Embedding ngữ nghĩa và RAG',
    projectId: 'p3',
    retention: 0.71,
    relevance: 0.89,
    lastReviewedAt: '2 ngày trước',
    reviewCount: 3,
    createdAt: '1 tuần trước',
    linkedLeaves: ['a13'],
  },
  {
    id: 'a16',
    content: 'Embedding-based retrieval chính xác hơn keyword search trên semantic queries (queries thiếu từ khóa chính xác).',
    type: 'proposition',
    sourceNoteId: 'n6',
    sourceNoteTitle: 'Embedding ngữ nghĩa và RAG',
    projectId: 'p3',
    retention: 0.62,
    relevance: 0.76,
    lastReviewedAt: '5 ngày trước',
    reviewCount: 2,
    createdAt: '2 tuần trước',
    linkedLeaves: ['a13', 'a14'],
  },

  // Project 4: Sinh học
  {
    id: 'a17',
    content: 'CRISPR-Cas9 cắt DNA tại vị trí được guide RNA định hướng, nhận diện qua trình tự bổ sung 20 nucleotide.',
    type: 'definition',
    sourceNoteId: 'n7',
    sourceNoteTitle: 'CRISPR-Cas9 — Cơ chế cắt DNA',
    projectId: 'p4',
    retention: 0.42,
    relevance: 0.31,
    surfacingType: 'forgetting',
    surfacingReason: 'Lĩnh vực ngủ đông — relevance thấp, retention sắp dưới 40%',
    lastReviewedAt: '3 tuần trước',
    nextReviewAt: 'quá hạn 9 ngày',
    reviewCount: 2,
    createdAt: '2 tháng trước',
    linkedLeaves: [],
    dormant: true,
  },
  {
    id: 'a18',
    content: 'PAM sequence (NGG cho SpCas9) phải nằm ngay sau target sequence để Cas9 có thể cắt.',
    type: 'fact',
    sourceNoteId: 'n7',
    sourceNoteTitle: 'CRISPR-Cas9 — Cơ chế cắt DNA',
    projectId: 'p4',
    retention: 0.38,
    relevance: 0.28,
    lastReviewedAt: '1 tháng trước',
    reviewCount: 1,
    createdAt: '2 tháng trước',
    linkedLeaves: ['a17'],
    dormant: true,
  },

  // Project 5: Lịch sử
  {
    id: 'a19',
    content: 'Phong trào Cần Vương khởi từ chiếu Cần Vương 1885 của vua Hàm Nghi sau biến cố thất thủ kinh đô Huế.',
    type: 'fact',
    sourceNoteId: 'n8',
    sourceNoteTitle: 'Phong trào Cần Vương',
    projectId: 'p5',
    retention: 0.55,
    relevance: 0.22,
    lastReviewedAt: '2 tuần trước',
    reviewCount: 3,
    createdAt: '3 tháng trước',
    linkedLeaves: [],
    dormant: true,
  },
]

export const decompositionDemo: DecompositionDemo = {
  noteId: 'n2',
  title: 'Kuhn — Paradigm shift và khoa học cách mạng',
  body: [
    {
      type: 'p',
      segments: [
        { text: 'Trong tác phẩm ' },
        { text: 'The Structure of Scientific Revolutions', italic: true },
        { text: ' (1962), Thomas Kuhn lập luận rằng ' },
        { text: 'khoa học không tiến hoá tuyến tính qua tích lũy dữ liệu', leafId: 'a2', leafType: 'proposition' },
        { text: ', mà qua các giai đoạn xen kẽ giữa ' },
        { text: 'normal science', leafId: 'a3', leafType: 'definition' },
        { text: ' và ' },
        { text: 'scientific revolution', leafId: 'a3b', leafType: 'definition' },
        { text: '.' },
      ],
    },
    {
      type: 'p',
      segments: [
        { text: 'Trong giai đoạn normal science, các nhà khoa học vận hành trong khuôn khổ một ' },
        { text: 'paradigm', leafId: 'a3c', leafType: 'definition' },
        { text: ' chung — tập hợp các giả định, phương pháp và mô hình mẫu được cộng đồng chấp nhận. Khi các ' },
        { text: 'anomaly tích tụ đủ lớn dẫn tới crisis và revolution', leafId: 'a3', leafType: 'relation' },
        { text: ', paradigm cũ bị thay thế.' },
      ],
    },
    {
      type: 'p',
      segments: [
        { text: 'Khái niệm này khác biệt căn bản với ' },
        { text: 'falsificationism của Popper', leafId: 'a1', leafType: 'definition' },
        { text: ' — Popper xem khoa học là quá trình bác bỏ giả thuyết liên tục, trong khi Kuhn cho rằng các nhà khoa học bám paradigm cho đến khi không thể.' },
      ],
    },
  ],
  detectedLeaves: [
    { id: 'a2', content: 'Kuhn cho rằng khoa học tiến hoá qua các paradigm shift, không phải tích lũy tuyến tính.', type: 'proposition', confidence: 0.96, status: 'existing' },
    { id: 'a3', content: 'Normal science vận hành trong khuôn khổ paradigm; khi anomaly tích tụ đủ lớn, crisis xảy ra dẫn tới revolution.', type: 'relation', confidence: 0.92, status: 'existing' },
    { id: 'a3b', content: 'Scientific revolution là giai đoạn paradigm cũ bị thay thế bởi paradigm mới.', type: 'definition', confidence: 0.88, status: 'new' },
    { id: 'a3c', content: 'Paradigm là tập hợp các giả định, phương pháp và mô hình mẫu được cộng đồng khoa học chấp nhận.', type: 'definition', confidence: 0.94, status: 'new' },
    { id: 'a1', content: 'Falsifiability là tiêu chí phân biệt khoa học với phi-khoa học, không phải verifiability.', type: 'definition', confidence: 0.85, status: 'linked' },
  ],
  insights: [
    { kind: 'related', text: 'Liên kết phát hiện: paradigm shift ↔ falsificationism (đối lập nhận thức luận)' },
    { kind: 'gap', text: 'Khoảng trống: chưa có lá nào về "incommensurability" — khái niệm liền kề Kuhn thường đề cập' },
    { kind: 'conflict', text: 'Mâu thuẫn nhẹ với lá #a1 — Popper và Kuhn quan điểm trái ngược' },
  ],
}

// Forgetting curve — 30 ngày, retention dự đoán
export const forgettingCurveData: ForgettingCurvePoint[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const user = Math.pow(0.9, day / 5.2)
  const fsrs = Math.pow(0.9, day / 6.5)
  return { day, user, fsrs }
})

// Topic heat map (12 tuần × 5 chủ đề)
export const topicHeatmap: TopicHeatmapItem[] = [
  { project: 'Triết học khoa học', weeks: [0.2, 0.3, 0.5, 0.7, 0.8, 0.95, 0.9, 0.92, 0.88, 0.95, 0.93, 0.92] },
  { project: 'FSRS', weeks: [0.1, 0.15, 0.4, 0.7, 0.85, 0.9, 0.88, 0.82, 0.78, 0.75, 0.78, 0.78] },
  { project: 'NLP', weeks: [0, 0, 0.1, 0.2, 0.3, 0.45, 0.55, 0.6, 0.6, 0.55, 0.55, 0.55] },
  { project: 'Sinh học', weeks: [0.7, 0.65, 0.6, 0.5, 0.45, 0.4, 0.38, 0.36, 0.34, 0.34, 0.34, 0.34] },
  { project: 'Lịch sử VN', weeks: [0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.22, 0.2, 0.2, 0.18, 0.18, 0.18] },
]

// Cognitive profile inferred from behavior
export const cognitiveProfile: CognitiveProfile = {
  traits: [
    { label: 'Kiểu học mạnh nhất', value: 'Active recall', detail: 'Hiệu quả cao hơn 34% so với passive review' },
    { label: 'Cường độ ôn ưa thích', value: 'Trung bình — thưa', detail: 'Khoảng cách review optimal: 1.8× FSRS mặc định' },
    { label: 'Tốc độ quên', value: 'Nhanh hơn TB 22%', detail: 'Đặc biệt với formula và năm tháng cụ thể' },
    { label: 'Granularity ưa thích', value: 'Mịn', detail: 'Bạn nhớ tốt hơn khi lá ngắn (< 25 từ)' },
    { label: 'Format câu hỏi hiệu quả', value: 'Cloze + ứng dụng', detail: 'Định nghĩa ngược cho retention thấp hơn 18%' },
  ],
  streak: 47,
  totalLeaves: 142,
  totalReviews: 1284,
  avgRetention: 0.71,
}

export const todayStats: TodayStats = {
  needReview: 7,
  reviewed: 3,
  newLeaves: 5,
  studyMinutes: 24,
  streakDays: 47,
}

export const conflicts: Conflict[] = [
  {
    id: 'c1',
    severity: 'medium',
    leaves: ['a1', 'a5'],
    summary: 'Falsifiability đơn lẻ vs Duhem-Quine holism',
    detail: 'Lá #a1 nói lý thuyết phải falsifiable, nhưng lá #a5 nói ta không thể test giả thuyết đơn lẻ — cần ghi chú giải hoà.',
  },
  {
    id: 'c2',
    severity: 'low',
    leaves: ['a13', 'a14'],
    summary: 'Trùng nghĩa nhẹ giữa hai lá embedding',
    detail: 'Hai lá có cosine similarity 0.91 — đề xuất merge hoặc tách rõ phạm vi.',
  },
]

// Knowledge graph nodes & edges
export const graphNodes: GraphNode[] = [
  { id: 'a1', x: 420, y: 200, r: 22, content: 'Falsifiability', cluster: 'p1', retention: 0.78 },
  { id: 'a2', x: 580, y: 280, r: 20, content: 'Paradigm shift', cluster: 'p1', retention: 0.65 },
  { id: 'a3', x: 680, y: 200, r: 16, content: 'Normal science', cluster: 'p1', retention: 0.72 },
  { id: 'a4', x: 540, y: 400, r: 14, content: 'Research programmes', cluster: 'p1', retention: 0.45 },
  { id: 'a5', x: 320, y: 320, r: 16, content: 'Duhem-Quine', cluster: 'p1', retention: 0.83 },
  { id: 'a6', x: 240, y: 220, r: 14, content: 'Bayesian', cluster: 'p1', retention: 0.69 },
  { id: 'a7', x: 200, y: 360, r: 18, content: 'Hume induction', cluster: 'p1', retention: 0.91 },

  { id: 'a8', x: 880, y: 380, r: 24, content: 'FSRS 3-component', cluster: 'p2', retention: 0.88 },
  { id: 'a9', x: 1000, y: 320, r: 16, content: 'Stability', cluster: 'p2', retention: 0.74 },
  { id: 'a10', x: 1020, y: 460, r: 14, content: 'Review interval', cluster: 'p2', retention: 0.56 },
  { id: 'a11', x: 920, y: 500, r: 18, content: 'MLE per-user', cluster: 'p2', retention: 0.81 },
  { id: 'a12', x: 780, y: 480, r: 14, content: 'SM-2 vs FSRS', cluster: 'p2', retention: 0.68 },

  { id: 'a13', x: 1140, y: 180, r: 20, content: 'Embedding', cluster: 'p3', retention: 0.86 },
  { id: 'a14', x: 1240, y: 260, r: 16, content: 'Cosine similarity', cluster: 'p3', retention: 0.79 },
  { id: 'a15', x: 1080, y: 260, r: 16, content: 'RAG', cluster: 'p3', retention: 0.71 },
  { id: 'a16', x: 1200, y: 100, r: 14, content: 'Semantic search', cluster: 'p3', retention: 0.62 },

  { id: 'a17', x: 160, y: 540, r: 14, content: 'CRISPR-Cas9', cluster: 'p4', retention: 0.42 },
  { id: 'a18', x: 280, y: 580, r: 12, content: 'PAM sequence', cluster: 'p4', retention: 0.38 },
  { id: 'a19', x: 1180, y: 580, r: 12, content: 'Cần Vương 1885', cluster: 'p5', retention: 0.55 },
]

export const graphEdges: GraphEdge[] = [
  { from: 'a1', to: 'a2', strength: 0.6 },
  { from: 'a1', to: 'a4', strength: 0.5 },
  { from: 'a1', to: 'a5', strength: 0.8 },
  { from: 'a1', to: 'a6', strength: 0.4 },
  { from: 'a1', to: 'a7', strength: 0.7 },
  { from: 'a2', to: 'a3', strength: 0.9 },
  { from: 'a2', to: 'a4', strength: 0.7 },
  { from: 'a3', to: 'a4', strength: 0.6 },
  { from: 'a5', to: 'a6', strength: 0.5 },
  { from: 'a6', to: 'a7', strength: 0.7 },
  { from: 'a8', to: 'a9', strength: 0.9 },
  { from: 'a8', to: 'a10', strength: 0.85 },
  { from: 'a8', to: 'a11', strength: 0.95 },
  { from: 'a8', to: 'a12', strength: 0.6 },
  { from: 'a9', to: 'a10', strength: 0.7 },
  { from: 'a11', to: 'a12', strength: 0.5 },
  { from: 'a13', to: 'a14', strength: 0.92 },
  { from: 'a13', to: 'a15', strength: 0.8 },
  { from: 'a13', to: 'a16', strength: 0.7 },
  { from: 'a14', to: 'a16', strength: 0.6 },
  { from: 'a17', to: 'a18', strength: 0.85 },
  // Cross-cluster
  { from: 'a8', to: 'a13', strength: 0.35, crossCluster: true },
  { from: 'a4', to: 'a8', strength: 0.25, crossCluster: true },
]

export const reviewQueue: string[] = ['a4', 'a10', 'a17', 'a2', 'a16', 'a18', 'a12']
