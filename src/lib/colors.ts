/** 픽카 브랜드 컬러 시스템 — 모든 스타일 값은 이 파일에서만 참조한다 */
export const Colors = {
  /** 브랜드 그린 계열 */
  brand: {
    green: "#3D6420",
    greenDark: "#3A6218",
    greenLight: "#E6EDDB",
    greenMid: "#C8DDA8",
    /** 입력 카드·업로드 버튼 등 연한 그린 서페이스 */
    greenSurface: "#DDE6D1",
  },

  /** 액션 컬러 */
  action: {
    orange: "#FF8C18",
    orangeLight: "#F2B35D",
    /** 학습 카드 아이콘 컬러 */
    orangeDark: "#C08A00",
    /** 학습 카드 텍스트 액션 컬러 */
    orangeDeep: "#A07000",
  },

  /** 텍스트 */
  text: {
    primary: "#1A1A1A",
    secondary: "#666666",
    subtitle: "#5E6B63",
    tertiary: "#999999",
    white: "#FFFFFF",
  },

  /** 배경 */
  bg: {
    default: "#F8F8F8",
    white: "#FFFFFF",
    card: "#FFFFFF",
    /** 덱 뒷장 등 무채색 서브 서페이스 */
    muted: "#E8E8E8",
    /** 취소 버튼 배경 */
    cancelButton: "#F5F4ED",
  },

  /** 탭바 */
  tab: {
    active: "#3A6218",
    inactive: "#999999",
    bg: "#FFFFFF",
    border: "#EEEEEE",
  },

  /** 구분선 */
  divider: "#EEEEEE",

  /** 그림자 */
  shadow: "#000000",

  /** 테두리 */
  border: {
    /** 입력 카드 테두리 */
    input: "#D7D3CB",
    /** 아웃라인 버튼 테두리 */
    button: "#D0D0D0",
    /** TextInput 비활성 아웃라인 */
    inputOutline: "#A9B0A6",
  },

  /** 시맨틱 — 성공·오류·경고 (추후 확장) */
  semantic: {
    /** 파괴 액션 버튼 (삭제·되돌리기 불가) */
    danger: "#BF3F2F",
    /** 오답 카드 아이콘 등 연한 위험 서페이스 */
    dangerLight: "#F5DDD9",
    /** 단어장 그룹 카드 등 중간 진행률 막대 */
    progressOrange: "#E8954A",
  },

  /** 비활성화 상태 */
  disabled: {
    bg: "#DDDDDD",
    text: "#A3A3A3",
  },
} as const;
