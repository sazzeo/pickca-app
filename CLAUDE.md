# Pickca App (React Native)

## 문서
- 서비스 개요·아키텍처·크로스커팅: `../docs/CLAUDE.md`
- 도메인별 정책·API: `../docs/domains/{도메인}.md`
- 인증: `../docs/auth-flow.md` | 도메인 모델: `../docs/domain-model.md`

## 서비스
영어 텍스트 → 단어 추출 → 단어장 → 플래시카드·퀴즈 암기 앱.
이 앱: 암기·퀴즈 | 웹(pickca-web): 복붙·추출·저장·어드민

## 기술 스택
- Expo SDK 52 + Expo Router v4 + TypeScript
- React Native Paper (MD3) — 테마: `src/lib/theme.ts`, primary `#4A7C1F`
- axios + @tanstack/react-query v5 + orval (OpenAPI → 훅 자동생성)
- expo-secure-store (`src/lib/storage.ts`), AuthContext (`src/contexts/AuthContext.tsx`)
- react-native-gesture-handler + react-native-reanimated

### axiosInstance (`src/lib/axios.ts`)
- `X-Client-Type: APP` / `Authorization: Bearer {accessToken}` 자동 첨부
- 401 → refresh 후 재시도, 실패 시 `/(auth)/sign-in` 리다이렉트
- 토큰 갱신만 raw axios 직접 사용 (인터셉터 루프 방지)

## orval
- 생성: `pnpm generate` (Spring API localhost:8200 필요)
- 위치: `src/api/generated/` — Git 포함, 직접 수정 금지
- API 호출은 반드시 orval 훅 사용. axiosInstance 직접 호출 금지.
- 훅 없으면 `pnpm generate` 먼저. 백엔드 없으면 백엔드 완료 후 생성. 수동 작성 금지.
- 응답 구조 확인: `pickcaAPI.schemas.ts` → `../docs/domains/` → 백엔드 소스 순서. 백엔드 먼저 열지 말 것.

## 구현 현황 (미연동)
- 단어장 추가: `POST /api/wordbooks/{id}/words` — WordResponse에 id 없음
- 홈 카운트: 하드코딩
- CEFR 레벨 PATCH, 퀴즈: 미구현

## 개발 환경
```
pnpm start / pnpm ios / pnpm android / pnpm generate
.env: EXPO_PUBLIC_API_URL=http://localhost:8200, GOOGLE_{IOS,ANDROID,WEB}_CLIENT_ID
```

## React Native 주의
- 스타일: `StyleSheet.create({})` 숫자만. CSS/px/em 없음.
- flexDirection 기본 column — 항상 명시
- View/Text/style={styles.xxx}. div/span/className 없음.
- 탭바: 커스텀 BottomTabBar.tsx. DevTools: 시뮬레이터 기준.

## 공통 컴포넌트

새 화면을 만들 때 아래 컴포넌트를 먼저 확인한다. 인라인으로 중복 구현하지 않는다.
2곳 이상에서 동일한 UI가 쓰이면 공통 컴포넌트로 분리한다. 기준: "이 컴포넌트가 바뀔 때 다른 곳도 같이 바뀌어야 하는가?" — 그렇다면 공통화.

| 컴포넌트 | 위치 | 용도 |
|----------|------|------|
| Button | components/common/Button.tsx | variant(primary/secondary/danger/ghost) × size(lg/md/sm) 버튼 |
| AppHeader | components/common/AppHeader.tsx | 메인 탭 화면 헤더 (로고 + 설정) |
| ScreenHeader | components/common/ScreenHeader.tsx | 서브 화면 헤더 (뒤로가기 + 타이틀 + 우측 슬롯) |
| AlertDialog | components/common/AlertDialog.tsx | 알림 다이얼로그 |
| ConfirmDialog | components/common/ConfirmDialog.tsx | 확인/취소 다이얼로그 |
| LearningStatusChip | components/common/LearningStatusChip.tsx | 학습 상태 칩 |
| EllipsisDropdownMenu | components/common/EllipsisDropdownMenu.tsx | 더보기(⋯) 드롭다운 |
| WordbookSelectModal | components/common/WordbookSelectModal.tsx | 단어장 선택 바텀시트 |
| BottomTabBar | components/common/BottomTabBar.tsx | 커스텀 탭바 |

## 컨벤션

### 패키지·스타일
- pnpm만. npm/yarn 금지.
- 쌍따옴표, prettier (`pnpm lint:fix`, `pnpm fm:fix`)

### 커밋
형식: `{type}({scope}): {한국어}` — feat/fix/refactor/docs/test/chore
작업 완료 후 반드시 커밋. 커밋 전 `pnpm lint:fix`.

### 터치
Pressable만. TouchableOpacity/TouchableHighlight 금지.
```tsx
<Pressable
  style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
  onPress={fn} hitSlop={12} accessibilityRole="button" accessibilityLabel="설명"
>
```
pressed: `opacity: 0.85` 또는 backgroundColor 변경.

### 색상
`src/lib/colors.ts`의 Colors 토큰만. 하드코딩 금지. 없는 색은 colors.ts에 추가 후 사용.
- `Colors.brand.*` — green, greenDark, greenLight, greenMid, greenSurface
- `Colors.action.*` — orange, orangeLight, orangeDark, orangeDeep
- `Colors.text.*` — primary, secondary, tertiary, white
- `Colors.bg.*` — default, white, card, muted
- `Colors.border.*` — input, button
- `Colors.semantic.*` — danger | `Colors.disabled.*` — bg, text
- `Colors.divider` / `Colors.tab.*`

### 타입
- 화면 파일에서 도메인 타입 export 금지 → `src/types/`
- orval 생성 타입 수정 금지
- 파일 내부 전용 타입은 `interface`로 정의 (type 대신)

### 탭·Export·StyleSheet·상수
- 탭 아이콘·레이블: `BottomTabBar.tsx`의 `TAB_CONFIG`에서만. `_layout.tsx`에 tabBarIcon 추가 금지.
- `app/**/*.tsx`: `export default function` | `src/components/**/*.tsx`: `export function` (named)
- StyleSheet 파일당 하나, 맨 아래, camelCase. 인라인 금지 (동적 합성 예외: `[styles.x, { paddingTop: insets.top }]`)
- 고정 설정: `UPPER_SNAKE_CASE` 상수를 컴포넌트 외부 파일 상단에 정의.

## 상태 관리
- 서버 데이터: useQuery | 서버 변경: useMutation | UI: useState | 전역 인증: useAuth()
- Zustand/Jotai/Redux 금지. 서버 데이터를 useState에 담지 않는다.

## 레이아웃 패턴
```tsx
// 탭 화면
const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);
<ScrollView contentContainerStyle={{ paddingBottom: tabBarApproxHeight + 24 }} keyboardShouldPersistTaps="handled">

// 모달형 화면
<View style={[styles.header, { paddingTop: insets.top + 8 }]} />
<View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]} />
```
SafeAreaView 사용 시 edges 명시. 하단: `Math.max(insets.bottom, N)`.

## 다이얼로그
- 확인/취소 선택이 필요한 경우: `ConfirmDialog` 사용.
- 단순 알림(확인 버튼만): `AlertDialog` 사용.
- `Alert.alert` 사용 금지. 모든 다이얼로그는 공통 컴포넌트를 사용한다.

## 에러 처리
```tsx
setAlertState({ title: "오류", description: "메시지" });  // AlertDialog 사용

const handleSubmit = async () => {
  setIsSubmitting(true);
  try { await doSomething(); }
  catch (e) { /* 처리 */ }
  finally { setIsSubmitting(false); }  // 반드시 finally
};
```

## 화면 간 데이터 전달
params에는 ID·인덱스 등 식별자만. 객체·배열 JSON 직렬화 전달 금지.
- URL 길이 제한 위험, 데이터 신선도 미보장, React Query 캐시 우회 문제.
- 캐시 히트 시 수신 화면에서 API 재호출해도 추가 네트워크 없음.

```tsx
// 올바름
router.push({ pathname: "/word-card", params: { wordbookId: "123", initialIndex: "0" } });
// 금지
// router.push({ pathname: "/word-card", params: { words: JSON.stringify(allWords) } });
```

예외 (세 조건 모두 충족 시만): API 엔드포인트 없음 + 소량(단일 객체) + `// NOTE: API 없어서 직렬화 전달` 주석 명시.

## 기타
- 아이콘: `MaterialCommunityIcons` from `@expo/vector-icons`만. 타입 실패 시 `name={x as never}` 허용.
- 개발 전용: `{__DEV__ && ...}` 래핑, 목업은 `MOCK_` prefix.
- UI 작업 전 `DESIGN.md` 필독. colors.ts/theme.ts 충돌 시 DESIGN.md 기준.
- 웹↔앱: 스토리지(localStorage vs expo-secure-store), Client-Type(WEB vs APP), 환경변수(NEXT_PUBLIC_ vs EXPO_PUBLIC_), Google 로그인 패키지 다름.