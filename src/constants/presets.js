export const CATEGORIES = {
  class: { id: 'class', label: '고정 수업', icon: '🎓', defaultColor: '#7dd3fc', isShared: true },
  self_study: { id: 'self_study', label: '자습', icon: '📖', defaultColor: '#ffe600', isShared: true },
  routine: { id: 'routine', label: '운동', icon: '🏋️', defaultColor: '#7ef6d6', isShared: false },
  other: { id: 'other', label: '휴식', icon: '☕', defaultColor: '#d8b4fe', isShared: false }
};

export const HIGHLIGHT_COLORS = [
  { hex: '#ffe600', name: '형광 노랑' },
  { hex: '#7ef6d6', name: '형광 민트' },
  { hex: '#ff8c53', name: '형광 주황' },
  { hex: '#d8b4fe', name: '형광 라벤더' },
  { hex: '#7dd3fc', name: '형광 하늘' },
  { hex: '#bef264', name: '형광 라임' },
  { hex: '#f472b6', name: '형광 핑크' },
  { hex: '#f87171', name: '형광 레드' },
  { hex: '#cbd5e1', name: '무채색 회색' }
];

export const PRESET_EMOJIS = [
  '✨', '🔥', '📚', '💻', '🏋️', '🧘', '🏃', '🍔', '☕', 
  '💊', '🎨', '🎮', '🛒', '🎬', '🗣️', '💼', '🚇', '✈️',
  '🎵', '💸', '📝', '🧹', '🛁', '🛌', '💡', '🏆', '🎧', '🎸'
];

export const DAYS_OF_WEEK = [
  { id: 1, short: '월', full: '월요일' },
  { id: 2, short: '화', full: '화요일' },
  { id: 3, short: '수', full: '수요일' },
  { id: 4, short: '목', full: '목요일' },
  { id: 5, short: '금', full: '금요일' },
  { id: 6, short: '토', full: '토요일' },
  { id: 7, short: '일', full: '일요일' }
];

export const INITIAL_SAMPLE_BLOCKS = [
  {
    id: 'blk_demo_1',
    title: '알고리즘 기초',
    category: 'class',
    dayOfWeek: 1, // Mon
    startTime: '09:30',
    endTime: '11:00',
    color: '#7dd3fc',
    location: '공학관 302호',
    subtasks: [],
    memo: '중간고사 범위: Graph & Dynamic Programming'
  },
  {
    id: 'blk_demo_2',
    title: '알고리즘 문제 풀이',
    category: 'self_study',
    dayOfWeek: 1, // Mon
    startTime: '14:00',
    endTime: '16:20',
    color: '#ffe600',
    location: '중앙도서관 3층',
    subtasks: [
      { id: 'st_1', text: '백준 골드 문제 2개 풀기', completed: true },
      { id: 'st_2', text: 'DFS/BFS 알고리즘 오답 노트 작성', completed: false }
    ],
    memo: '몰입하여 집중 자습'
  },
  {
    id: 'blk_demo_3',
    title: '컴퓨터 구조 수업',
    category: 'class',
    dayOfWeek: 2, // Tue
    startTime: '10:00',
    endTime: '11:50',
    color: '#7dd3fc',
    location: 'IT 융합관 101호',
    subtasks: [],
    memo: '파이프라이닝 및 캐시 메모리'
  },
  {
    id: 'blk_demo_4',
    title: '전공서적 4장 독서 & 요약',
    category: 'self_study',
    dayOfWeek: 2, // Tue
    startTime: '15:10',
    endTime: '17:30',
    color: '#ffe600',
    location: '열람실',
    subtasks: [
      { id: 'st_3', text: '캐시 매핑 방식 정리', completed: false },
      { id: 'st_4', text: '연습문제 1~5번 풀기', completed: false }
    ],
    memo: ''
  },
  {
    id: 'blk_demo_5',
    title: '알고리즘 기초',
    category: 'class',
    dayOfWeek: 3, // Wed
    startTime: '09:30',
    endTime: '11:00',
    color: '#7dd3fc',
    location: '공학관 302호',
    subtasks: [],
    memo: ''
  },
  {
    id: 'blk_demo_6',
    title: '헬스장 하체 루틴',
    category: 'routine',
    dayOfWeek: 3, // Wed
    startTime: '13:00',
    endTime: '14:40',
    color: '#7ef6d6',
    location: '피트니스 센터',
    subtasks: [
      { id: 'st_5', text: '스쿼트 5세트', completed: true },
      { id: 'st_6', text: '런지 4세트', completed: true }
    ],
    memo: '유산소 20분 추가'
  },
  {
    id: 'blk_demo_7',
    title: '리액트 프로젝트 개발',
    category: 'self_study',
    dayOfWeek: 3, // Wed
    startTime: '16:00',
    endTime: '18:30',
    color: '#ff8c53',
    location: '카페',
    subtasks: [
      { id: 'st_7', text: '10분 단위 타임슬롯 배치 컴포넌트 완성', completed: true },
      { id: 'st_8', text: 'Firebase Sync 연동', completed: true }
    ],
    memo: ''
  },
  {
    id: 'blk_demo_8',
    title: '컴퓨터 구조 수업',
    category: 'class',
    dayOfWeek: 4, // Thu
    startTime: '10:00',
    endTime: '11:50',
    color: '#7dd3fc',
    location: 'IT 융합관 101호',
    subtasks: [],
    memo: ''
  },
  {
    id: 'blk_demo_9',
    title: '코딩테스트 복습',
    category: 'self_study',
    dayOfWeek: 4, // Thu
    startTime: '19:00',
    endTime: '21:10',
    color: '#ffe600',
    location: '자택',
    subtasks: [
      { id: 'st_9', text: '프로그래머스 레벨 2 풀이', completed: false }
    ],
    memo: ''
  },
  {
    id: 'blk_demo_10',
    title: '주간 자습 회고 및 계획',
    category: 'other',
    dayOfWeek: 5, // Fri
    startTime: '11:00',
    endTime: '12:30',
    color: '#d8b4fe',
    location: '스터디룸',
    subtasks: [
      { id: 'st_10', text: '이번주 실제 자습시간 달성률 측정', completed: false }
    ],
    memo: ''
  }
];
