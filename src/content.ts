// ============================================================
// CONTENT — all copy lives here, split by language. (v0.2.4)
// Mirrors "Blog v0.2.2.dc.html".
// ============================================================

export type LifeId = 'run' | 'drum' | 'words' | 'outdoor' | 'arts' | 'tbd';

export interface LifeItem {
  title: string;
  micro: string;
  desc: string;
  detail: string;
}

// Experience is master-detail.
//   summary view shows `year` + `title` (+ detailTitle, always visible)
//   expanded view reveals `points` (staggered bullets)
//   `child: true` nests the row under the one above it (indented + ↳ connector).
export interface Experience {
  year: string;
  title: string;
  detailTitle: string;
  points: string[];
  child?: boolean;
}

export interface Content {
  identity: string;
  heroName: string;
  heroSub: string;
  heroHint: string;
  about: string[];
  stackLabel: string;
  chipsRow1: string[];
  chipsRow2: string[];
  lifeIntro: string;
  experience: Experience[];
  life: LifeItem[]; // order matches LIFE_IDS
  lifeDetailNote: string;
  contactHeadline: string;
  contactInvite: string;
  contactBullets: string[];
  contactNote: string;
}

export const LIFE_IDS: LifeId[] = ['run', 'drum', 'words', 'outdoor', 'arts', 'tbd'];

export const AUTHOR_NAME = '김도현';

export const NAV = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'exp', label: 'Experience' },
  { id: 'life', label: 'Life' },
  { id: 'contact', label: 'Contact' },
] as const;

export const SOCIALS = [
  { label: 'Email', href: 'mailto:kimdohyun7942@khu.ac.kr' },
  { label: 'GitHub', href: 'https://github.com/dohyun-jose-kim' },
];

const KO: Content = {
  identity: '자연을 좋아하고 도전을 즐깁니다.',
  heroName: '김도현',
  heroSub: "L'Étranger who pushes boundaries and tells stories.",
  heroHint: '',
  about: [
    '호기심을 아끼고 사랑합니다.',
    '정확함과 우아함 사이의 균형을 찾습니다.',
  ],
  stackLabel: '관심 분야',
  chipsRow1: ['합성생물학', '전산생물학', '로보틱스'],
  chipsRow2: ['유전체·유전학', '마이크로바이옴 공학', '신소재공학'],
  lifeIntro: '퍼즐 모으기',
  experience: [
    {
      year: '2026.02 — 현재',
      title: '㈜인실리코젠 · 연구원',
      detailTitle: 'Food Domain AI & Data Analysis',
      points: [
        'Python 기반 데이터 분석 — 국민건강영양조사(KNHANES) 영양 섭취 데이터',
        'Graph DB · Vector DB 구축(논문 및 문서)',
        'RAG 기반 LLM Chatbot(국립수산과학원 등)',
        'Topic Modeling(논문 및 문서)',
        'NER · RE (Named Entity Recognition & Relation Extraction)',
      ],
    },
    {
      year: '2026.01 — 02',
      title: '인코인턴십 19기',
      detailTitle: '산업 현장의 bioinformatics 입문',
      child: true,
      points: [
        'Linux·R·Python 컴퓨팅 기초',
        'R 기반 RNA-seq DEG 파이프라인 (기능분석·시각화)',
        'TensorFlow·Keras 딥러닝 이미지 분류',
      ],
    },
    {
      year: '2025.06 — 09',
      title: '서울대 진균생태계통학연구실 · 학부 인턴 (Prof. Lim)',
      detailTitle: '곰팡이·세균 eDNA metabarcoding, bioinformatics·taxonomy 입문',
      points: [
        '한국 전국 토양 eDNA NGS 라이브러리 구축, ITS 바코딩 및 QC',
        '메타바코딩 파이프라인으로 ASV추론 후 종 수준 classification (used QIIME2/DADA2 on Linux with PacBio CCS Samples)',
        'scikit-learn(Naive Bayes)+FunVIP 하이브리드로 종 수준 taxonomy 분류',
      ],
    },
    {
      year: '2025.01 — 02',
      title: '서울대 바이오융합과학연구실 · 학부 인턴 (Prof. Lee)',
      detailTitle: 'wet-lab 실험과 biophysics 입문',
      points: [
        '인지질 마이셀 제작·분석',
        '포유류 세포배양 (A375P, RAW 264.7)',
        'microdroplet 기반 ROS 생성·정량',
      ],
    },
    {
      year: '2021.06 — 11',
      title: '경희대 지속가능에너지기술연구실 · 학부 인턴 (Prof. Lee)',
      detailTitle: '공학적 사고와 연구실에 대한 첫 경험',
      points: ['리튬이온/메탈 이차전지 경험', '아르곤(Ar) 글러브박스 첫 경험'],
    },
    {
      year: '2020.03 — 2026.02',
      title: '경희대학교 융합바이오신소재공학과 · 학사',
      detailTitle: 'materials·agriculture·biopharma·bioinformatics를 아우른 biotech 학부',
      points: ['GPA 3.74 / 4.3 (4.02 / 4.5)'],
    },
  ],
  life: [
    { title: '러닝 · 철인삼종', micro: 'Running·Triathlon', desc: '', detail: '10K 38분 · 하프 1:34 · 풀마라톤 3:51 · 철인3종 2:52' },
    { title: '드럼', micro: 'Drums', desc: '', detail: '락 드럼을 칩니다. 미국 메탈 밴드 Slipknot을 가장 좋아합니다.' },
    { title: '글쓰기와 책읽기', micro: 'Words', desc: '', detail: '카뮈의 「이방인」을 가장 좋아합니다. 카뮈, 박준, 하루키, 카프카의 글을 즐깁니다.' },
    { title: '승마 · 요트 · 등산', micro: 'Equestrian·Sailing·Hiking', desc: '', detail: '마장마술(Dressage) Level 5, 경기요트학교 초급 수료. 트레일러닝 한라산 3:18 · 치악산 1:43 · 북한산 1:07' },
    { title: '건축 · 예술 · 자연 · 사진', micro: 'Arch·Art·Nature·Photo', desc: '', detail: '건축과 예술 공간을 거닐고, 자연과 일상을 사진으로 담습니다.' },
    { title: '새로운 도전!', micro: 'TBD', desc: '', detail: '곧 새로운 취미로 채워집니다.' },
  ],
  lifeDetailNote: '',
  contactHeadline: '대화는 언제든 환영입니다.',
  contactInvite: '연구, 아이디어, 커피 한 잔,\n무엇이든 편하게 연락 주세요.',
  contactBullets: ['Light-roast pour-over', 'Espresso con panna', 'Caffè corretto'],
  contactNote: 'Based in South Korea',
};

const EN: Content = {
  identity: 'Loves nature, thrives on a challenge.',
  heroName: 'Dohyun Kim',
  heroSub: "L'Étranger who pushes boundaries and tells stories.",
  heroHint: '',
  about: [
    'I treasure small curiosities and\nlove the borders between disciplines.',
    'I look for the balance between\nwhat is correct and what is beautiful.',
  ],
  stackLabel: 'Fields of interest',
  chipsRow1: ['Synthetic Biology', 'Computational Biology', 'Robotics'],
  chipsRow2: ['Genomics & Genetics', 'Microbiome Engineering', 'Materials Science'],
  lifeIntro: 'Collecting puzzle pieces',
  experience: [
    {
      year: '2026.02 — Present',
      title: 'INSILICOGEN · Junior Researcher',
      detailTitle: 'Food Domain AI & Data Analysis',
      points: [
        'Python-based data analysis — KNHANES (Korea National Health and Nutrition Examination Survey) nutrition intake data',
        'Built Graph DB · Vector DB(Research Papers and Documents)',
        'RAG-based LLM chatbot(NIFS and more)',
        'Topic modeling(Research Papers and Documents)',
        'NER · RE (Named Entity Recognition & Relation Extraction)',
      ],
    },
    {
      year: '2026.01 — 02',
      title: 'Internship Program (19th)',
      detailTitle: 'Introduction to bioinformatics in industry',
      child: true,
      points: [
        'Computing basics in Linux/R/Python',
        'Executed a RNA-seq DEG pipeline in R (functional analysis & visualization)',
        'TensorFlow/Keras deep-learning image classification',
      ],
    },
    {
      year: '2025.06 — 09',
      title: 'Mycology & Ecophylogeny Lab, SNU · Undergrad Intern (Prof. Lim)',
      detailTitle: 'Metabarcoding fungal & bacterial eDNA — into bioinformatics & taxonomy',
      points: [
        'Built NGS libraries from S. Korean soil eDNA; ITS barcoding and QC',
        'Ran a metabarcoding pipeline and generated ASVs (used QIIME2/DADA2 on Linux with PacBio CCS Samples)',
        'Species-level taxonomy via a hybrid of scikit-learn (Naive Bayes) and FunVIP, a tree based classification',
      ],
    },
    {
      year: '2025.01 — 02',
      title: 'Applied Bioscience & Engineering Lab, SNU · Undergrad Intern (Prof. Lee)',
      detailTitle: 'Introduction to wet-lab work and biophysics',
      points: [
        'Fabricated and analyzed phospholipid micelles',
        'Cultured mammalian cells (A375P, RAW 264.7)',
        'Generated and quantified ROS via microdroplets',
      ],
    },
    {
      year: '2021.06 — 11',
      title: 'Sustainable Energy Technology Lab, KHU · Undergrad Intern (Prof. Lee)',
      detailTitle: 'A first taste of lab research and engineering thinking',
      points: ['Hands-on with lithium-ion & metal secondary batteries', 'First hands-on experience with an argon (Ar) glove box'],
    },
    {
      year: '2020.03 — 2026.02',
      title: 'Kyung Hee University · BS, Convergent Biotech & Advanced Materials Science',
      detailTitle: 'A biotech degree spanning materials, agriculture, biopharma & bioinformatics',
      points: ['GPA 3.74 / 4.3 (4.02 / 4.5)'],
    },
  ],
  life: [
    { title: 'Running & Triathlon', micro: '', desc: '', detail: '10K 0:38 · Half 1:34 · Full 3:51 · Triathlon 2:52' },
    { title: 'Drums', micro: '', desc: '', detail: 'I play rock drums — my favorite band is the American metal band Slipknot.' },
    { title: 'Words', micro: '', desc: '', detail: "Albert Camus' L'Étranger is my favorite — I also love Park Joon, Haruki Murakami, and Franz Kafka." },
    { title: 'Equestrian · Sailing · Hiking', micro: '', desc: '', detail: 'Dressage Level 5; Gyeonggi-Do Sailing Federation beginner course. Trail Running Hallasan 3:18 · Chiaksan 1:43 · Bukhansan 1:07' },
    { title: 'Architecture, Art, Nature & Photography', micro: '', desc: '', detail: 'I wander through spaces of architecture and art, and capture nature and everyday life in photographs.' },
    { title: 'More to come', micro: '', desc: '', detail: 'A slot for a hobby still to come.' },
  ],
  lifeDetailNote: '',
  contactHeadline: 'You are always welcome.',
  contactInvite: 'Research, ideas, or just a coffee — reach out anytime.',
  contactBullets: ['Light-roast pour-over', 'Espresso con panna', 'Caffè corretto'],
  contactNote: 'Based in South Korea',
};

export const CONTENT: Record<'ko' | 'en', Content> = { ko: KO, en: EN };
