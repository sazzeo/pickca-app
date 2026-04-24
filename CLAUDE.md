# Pickca App (React Native)

## 전체 문서
- 서비스 개요·아키텍처·크로스커팅 정책: `../docs/CLAUDE.md`
- 도메인별 정책·API 스펙: `../docs/domains/{도메인}.md`
- 인증 플로우: `../docs/auth-flow.md` | 도메인 모델: `../docs/domain-model.md`

## 서비스 개요
영어 텍스트 붙여넣기 → 단어 추출 → 단어장 → 플래시카드·퀴즈 암기 모바일 앱.  
**이 앱**: 암기·퀴즈 위주 | **웹(pickca-web)**: 복붙·추출·저장 + 어드민

---

## 기술 스택
- **Expo SDK 52** + **Expo Router v4** + **TypeScript**
- **React Native Paper** (Material Design 3) — 테마: `src/lib/theme.ts`, primary 그린 `#4A7C1F`
- `axios` + `@tanstack/react-query` v5 + `orval` (OpenAPI → React Query 훅 자동 생성)
- **expo-secure-store** — 토큰 저장 (`src/lib/storage.ts`)
- **`@react-native-google-signin/google-signin`** — Google 로그인, `AuthContext` (`src/contexts/AuthContext.tsx`)
- **`react-native-gesture-handler`** + **`react-native-reanimated`** — 단어 카드 스와이프 등 제스처 처리

### axiosInstance (`src/lib/axios.ts`)
- `X-Client-Type: APP` / `Authorization: Bearer {accessToken}` 자동 첨부
- 401 → refresh token 갱신 후 재시도, 실패 시 `/(auth)/sign-in` 리다이렉트
- 토큰 갱신 로직만 raw `axios` 직접 사용 (인터셉터 무한루프 방지)

---

## orval 컨벤션

- **생성**: `pnpm generate` (Spring API `localhost:8200` 실행 필요)
- **생성 위치**: `src/api/generated/` — Git 포함, 직접 수정 금지
- **API 호출은 반드시 orval 생성 훅을 사용한다.** `axiosInstance` 직접 호출 금지.
- **⚠️ API 연동 시 훅이 없으면 `pnpm generate`를 먼저 실행해 생성한 뒤 사용한다.**  
  백엔드 엔드포인트가 없는 경우 백엔드 작업 완료 후 생성한다. 임의로 훅을 수동 작성하지 않는다.
- **API 응답 구조 확인 순서**: `src/api/generated/pickcaAPI.schemas.ts` → `../docs/domains/{도메인}.md` → 백엔드 소스 탐색.  
  백엔드 코드를 먼저 열지 않는다.

---

## 구현 현황

라우팅 구조는 `app/` 디렉터리를 직접 탐색. 특이사항은 `./app-routing.md` 참조.

### 미연동 (백엔드 선행 필요)
- 단어장에 추가: `POST /api/wordbooks/{id}/words` — `WordResponse`에 `id` 없음 (`api/TODOS.md`)
- 홈 카운트: `count={84}`, `count={18}` 하드코딩
- CEFR 레벨: `PATCH /api/members/me/cefr-level` 미구현
- 퀴즈: 미구현

---

## 개발 환경

```bash
# .env (참고: .env.example)
EXPO_PUBLIC_API_URL=http://localhost:8200
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...

pnpm start / pnpm ios / pnpm android
pnpm generate   # API 훅 재생성
```

---

## ⚠️ React Native — CSS 없다. 브라우저 없다. DOM 없다.

| 웹 | 이 앱 |
|----|-------|
| CSS / `px`, `em` 단위 | `StyleSheet.create({})`, 숫자만 |
| `display: flex` (기본 row) | `flexDirection` 기본 **column** — 항상 명시 |
| `div`, `span`, `className` | `View`, `Text`, `style={styles.xxx}` |
| 내장 탭바 | 커스텀 `BottomTabBar.tsx` |
| 웹 DevTools | iOS 시뮬레이터 / Android 에뮬레이터가 기준 |

---

## 개발 컨벤션

**패키지**: pnpm만. `npm`/`yarn` 금지.  
**코드 스타일**: 쌍따옴표 `"`, prettier 적용 (`pnpm lint:fix`, `pnpm fm:fix`)

### 커밋

형식: `{type}({scope}): {한국어 설명}` — type: feat/fix/refactor/docs/test/chore

**작업 완료 후 반드시 커밋한다.** 기능 단위로 논리적으로 나눠서 커밋하되, 하나의 작업 요청이 끝나면 적절한 커밋을 만든다.

- 기능 구현 완료 → `feat(wordbook): 단어장 상세 화면 구현`
- 버그 수정 → `fix(extract): PENDING 단어 재조회 누락 수정`
- 리팩터링만 → `refactor(auth): AuthContext 훅 분리`
- 여러 파일 수정이라도 하나의 작업이면 커밋 하나로 묶는다
- 커밋 전 `pnpm lint:fix`로 lint 정리

### 터치
**`Pressable`만 사용.** `TouchableOpacity`/`TouchableHighlight` 금지.
```tsx
<Pressable
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
  onPress={handlePress}
  hitSlop={12}
  accessibilityRole="button"
  accessibilityLabel="설명"
>
```
pressed 스타일: `opacity: 0.85` 또는 `backgroundColor` 변경.

### 색상
**모든 색상은 `src/lib/colors.ts`의 `Colors` 토큰 사용. 하드코딩 `"#XXXXXX"` 금지.**  
없는 색은 `colors.ts`에 먼저 추가 후 사용.

| 카테고리 | 설명 |
|----------|------|
| `Colors.brand.*` | green, greenDark, greenLight, greenMid, greenSurface |
| `Colors.action.*` | yellow, yellowLight, yellowDark, yellowDeep |
| `Colors.text.*` | primary, secondary, tertiary, white |
| `Colors.bg.*` | default, white, card, muted |
| `Colors.border.*` | input, button |
| `Colors.semantic.*` | danger |
| `Colors.disabled.*` | bg, text |
| `Colors.divider` / `Colors.tab.*` | 구분선 / 탭바 전용 |

### 타입
- 화면 파일에서 도메인 타입 `export` 금지 → `src/types/`에 위치
- orval 생성 타입(`src/api/generated/`) 직접 수정 금지
- 파일 내부 전용 타입은 같은 파일에 `interface`로 정의 (`type` 대신 `interface`)

### 탭 설정
탭 아이콘·레이블은 **`BottomTabBar.tsx`의 `TAB_CONFIG`에서만** 관리.  
`_layout.tsx` `Tabs.Screen`에 `tabBarIcon` 추가 금지.

### 컴포넌트 Export

| 위치 | 방식 |
|------|------|
| `app/**/*.tsx` | `export default function` (Expo Router 필수) |
| `src/components/**/*.tsx` | `export function` (named) |

### StyleSheet
파일당 하나, 맨 아래 위치. key는 camelCase.  
인라인 스타일 금지 — 동적 합성만 예외: `style={[styles.wrapper, { paddingTop: insets.top }]}`

### 상수/설정 객체
고정 설정은 `UPPER_SNAKE_CASE` 상수를 컴포넌트 **외부 파일 상단**에 정의.

---

## 상태 관리

| 종류 | 방법 |
|------|------|
| 서버 데이터 | `useQuery` |
| 서버 변경 | `useMutation` |
| UI 상태 | `useState` |
| 전역 인증 | `useAuth()` |

- Zustand/Jotai/Redux 등 추가 금지
- 서버 데이터를 `useState`에 담지 않는다 — React Query 캐시 사용
- 화면 간 데이터 전달: router params

---

## 화면 레이아웃 패턴

```tsx
// 탭 화면
const insets = useSafeAreaInsets();
const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);
<ScrollView contentContainerStyle={{ paddingBottom: tabBarApproxHeight + 24 }} keyboardShouldPersistTaps="handled">

// 탭 외부 화면 (모달형) — 직접 safe area 처리
<View style={[styles.header, { paddingTop: insets.top + 8 }]} />
<View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]} />
```
`SafeAreaView` 사용 시 `edges` 명시. 하단: `Math.max(insets.bottom, N)` 패턴.

---

## 에러 처리

```tsx
Alert.alert("오류", "메시지");                          // 단순 알림
showAlertDialog({ title: "...", actionLabel: "..." });  // 사용자 액션 필요 시

const handleSubmit = async () => {
  setIsSubmitting(true);
  try { await doSomething(); }
  catch (e) { /* 처리 */ }
  finally { setIsSubmitting(false); }  // 반드시 finally에서 해제
};
```

---

## 화면 간 데이터 전달

**원칙: params에는 ID·인덱스 등 식별자만 넘긴다. 객체·배열을 통째로 직렬화해 넘기는 것은 금지.**

이유:
- URL 길이 제한 위험 (단어 수 많아질수록 URI 초과 가능)
- 데이터 신선도 보장 안 됨 (화면 이동 후 API 변경 반영 불가)
- React Query 캐시를 우회해 이중 관리 발생

수신 화면에서 이미 해당 쿼리가 캐시되어 있으면 추가 네트워크 요청 없이 즉시 렌더링된다.

```tsx
// ✅ 올바른 방식 — ID/인덱스만 전달, 수신 측에서 API 호출
router.push({ pathname: "/word-card", params: { wordbookId: "123", initialIndex: "0" } });

// ✅ 단순 값
router.push({ pathname: "/detail", params: { id: "123" } });

// ❌ 금지 — 객체·배열 JSON 직렬화해서 넘기기
// router.push({ pathname: "/word-card", params: { words: JSON.stringify(allWords) } });
```

**예외**: 다음 조건을 모두 충족할 때만 JSON 직렬화 허용:
1. 해당 데이터를 가져올 API 엔드포인트가 없다
2. 전달 크기가 소량(단일 객체 수준)이다
3. 코드에 `// NOTE: API 없어서 직렬화 전달` 주석을 명시한다

현재 이 패턴을 쓰는 곳: `app/(tabs)/wordbook.tsx` → `app/(tabs)/wordbook-detail.tsx` (wordbookId만 전달하므로 적합)

---

## 기타

**아이콘**: `MaterialCommunityIcons` from `@expo/vector-icons`만 사용. 다른 패키지 추가 금지.  
타입 추론 실패 시 `name={iconName as never}` 허용.

**개발 전용 코드**: `{__DEV__ && ...}` 래핑, 목업 데이터는 `MOCK_` prefix.

**Design System**: UI 작업 전 `DESIGN.md` 필독. `colors.ts`/`theme.ts` 충돌 시 `DESIGN.md` 기준으로 맞춤.

**웹 vs 앱 주요 차이**:

| 항목 | 웹 | 앱 |
|------|----|-----|
| 스토리지 | localStorage + obfuscate | expo-secure-store |
| Client-Type | `WEB` | `APP` |
| 환경변수 | `NEXT_PUBLIC_` | `EXPO_PUBLIC_` |
| Google 로그인 | `@react-oauth/google` | `@react-native-google-signin/google-signin` |
