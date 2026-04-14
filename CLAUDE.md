# Pickca App (React Native)

## 통합 문서

전체 시스템 아키텍처·인증 플로우·도메인 모델·로컬 개발 가이드: `../pickca-docs/`

## 서비스 개요

영어 텍스트를 붙여넣으면 단어를 추출해 단어장을 만들고, 플래시카드·퀴즈로 암기하는 모바일 앱.

**이 앱(픽카-앱)**: 단어장 핵심 기능 (암기·퀴즈 위주)  
**웹(pickca-web)**: 복붙 → 단어 추출 → 저장 + 어드민

---

## 기술 스택

### 프레임워크
- **Expo SDK 52** + **Expo Router v4** (파일 기반 라우팅, Next.js App Router와 동일 패턴)
- **TypeScript**

### UI
- **React Native Paper** — MUI Material Design 3 기반, 웹의 MUI와 유사한 API
- 테마: `src/lib/theme.ts` (primary 그린 `#4A7C1F`, `DESIGN.md` 참고)

### API
- `axios` — Spring 서버 API 호출
- `@tanstack/react-query` v5 — 서버 상태 관리
- `orval` (devDependency) — Spring OpenAPI 스펙으로 React Query 훅 자동 생성

#### orval 사용 컨벤션

- **생성 명령**: `pnpm generate` (Spring API가 `localhost:8200`에서 실행 중이어야 함)
- **생성 위치**: `src/api/generated/` — 직접 수정 금지, 재생성 시 덮어씌워짐
- **API 호출은 반드시 orval 생성 훅을 사용한다.** `axiosInstance`를 직접 호출하지 않는다.
- **예외**: `src/lib/axios.ts` 내부의 토큰 갱신 로직은 인터셉터 무한루프 방지를 위해 raw `axios`를 직접 사용 (웹과 동일 정책)

#### axiosInstance 인터셉터 (`src/lib/axios.ts`)

- `X-Client-Type: APP` — 웹은 WEB, 앱은 APP으로 구분
- `Authorization: Bearer {accessToken}` — SecureStore에서 토큰 자동 첨부
- 401 응답 시 refresh token으로 자동 갱신 후 원래 요청 재시도
- 토큰 갱신 실패 시 `/(auth)/sign-in`으로 리다이렉트

### 토큰 저장
- **expo-secure-store** — iOS Keychain / Android Keystore에 암호화 저장
- 웹의 `localStorage + obfuscate` 방식보다 더 안전
- 토큰 관련 함수: `src/lib/storage.ts`

### 인증
- `@react-native-google-signin/google-signin` — Google 로그인
- Spring `POST /api/auth/social/google`에 idToken 전달
- Spring이 발급한 `accessToken`/`refreshToken`을 SecureStore에 저장
- `AuthContext` (`src/contexts/AuthContext.tsx`) — 전역 인증 상태
- 각 레이아웃의 Guard: `(auth)/_layout.tsx`, `(tabs)/_layout.tsx`

---

## 라우팅 구조 (Expo Router)

```
app/
├── _layout.tsx              # 루트 레이아웃 (QueryClient, PaperProvider, AuthProvider)
├── index.tsx                # 진입점 → 인증 여부에 따라 리다이렉트
├── extract-result.tsx       # 단어 추출 결과 화면 (탭 외부 화면)
├── (auth)/
│   ├── _layout.tsx          # 비인증 Guard (로그인 상태면 탭으로 리다이렉트)
│   └── sign-in.tsx          # 소셜 로그인 화면
└── (tabs)/
    ├── _layout.tsx          # 인증 Guard + 탭바 (미인증이면 로그인으로 리다이렉트)
    ├── index.tsx            # 홈 탭 (단어장·학습 카운트는 API 미연동, 하드코딩 상태)
    ├── extract.tsx          # 단어 추출 탭 ✅ API 연동 완료
    ├── wordbook.tsx         # 단어장 탭 🚧 준비 중
    ├── study.tsx            # 학습 탭 🚧 준비 중
    ├── quiz.tsx             # 퀴즈 화면 (탭바 미노출 — href: null) 🚧 준비 중
    └── profile.tsx          # 프로필·로그아웃 화면 (탭바 미노출 — href: null)
```

## 구현 현황 및 알려진 제약

### 완료
- Google 로그인: `GoogleSignInPanel.tsx` — 이메일은 Google SDK 응답(`data.user.email`)에서 가져온다. Spring `AuthTokenResponse`에 email 없음 (의도적)
- 단어 추출: `extract.tsx` → `useExtract` 훅 → `extract-result.tsx` 에 JSON params로 단어 전달
- 탭바: `BottomTabBar.tsx` 커스텀 구현 (React Navigation 내장 탭바는 웹 미리보기에서 렌더링 깨짐)
- 인증 가드: `(tabs)/_layout.tsx`, `(auth)/_layout.tsx`

### API 연동 필요 (백엔드 선행 작업 포함)
- **단어장에 추가하기**: `POST /api/wordbooks/{id}/words`에 `wordIds: number[]` 필요 → 현재 `WordResponse`에 `id` 없음. 백엔드 수정 + `pnpm generate` 후 연동 가능 (`api/TODOS.md` 참고)
- **홈 화면 카운트**: `index.tsx`의 `count={84}`, `count={18}` 하드코딩 → 단어장 API 연동 시 교체
- **CEFR 멤버 레벨 설정**: 프로필 화면에 미구현 (`PATCH /api/members/me/cefr-level`)
- **단어장·학습·퀴즈 탭**: 전체 미구현 (준비 중)

### API 타입 갱신 필요
- `WordResponseCollectStatus`에 `PARTIAL` 없음 — v0.0.1.2에서 추가됐으나 앱 타입에 미반영
- 갱신 방법: Spring 서버 기동 후 `pnpm generate`

---

## 개발 환경 설정

### 환경변수 (`.env` 파일 — `.env.example` 참고)

```bash
EXPO_PUBLIC_API_URL=http://localhost:8200
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...   # Expo Go 테스트용
```

> 웹에서 `NEXT_PUBLIC_` 접두사를 쓰듯, Expo에서는 `EXPO_PUBLIC_` 접두사를 사용한다.

### 앱 실행

```bash
pnpm install
pnpm start          # Metro 번들러 + QR 코드 (Expo Go 앱으로 스캔)
pnpm ios            # iOS 시뮬레이터
pnpm android        # Android 에뮬레이터
```

### API 코드 생성

```bash
# Spring API 서버가 실행 중이어야 함 (localhost:8200)
pnpm generate
```

### Google 로그인 세팅

1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 2.0 클라이언트 생성
   - iOS Client ID (Bundle ID: `cloud.pickca.app`)
   - Android Client ID (Package: `cloud.pickca.app`, SHA-1 지문 필요)
   - Web Client ID (Expo Go 테스트 및 Android 토큰 검증용)
2. `.env`에 각 Client ID 입력

---

## ⚠️ 이 프로젝트는 React Native 앱이다

**CSS 없다. 브라우저 없다. DOM 없다.**

| 웹 | 이 앱 |
|----|-------|
| CSS / StyleSheet (`.css`, `style=""`) | `StyleSheet.create({})` — React Native API |
| `px`, `em`, `rem` 단위 | 숫자만 (`width: 20`, `fontSize: 14`) |
| `display: flex` (CSS) | `flexDirection: "row"` (기본값이 column) |
| `className`, `id` | `style={styles.xxx}` |
| `div`, `span`, `p` | `View`, `Text`, `Pressable` |
| `border-radius: 8px` | `borderRadius: 8` |
| 브라우저 DevTools / 웹 렌더링 확인 | iOS 시뮬레이터 / Android 에뮬레이터 |
| React Navigation 웹 탭바 동작 | 커스텀 컴포넌트로 직접 구현 |

### UI 작업 원칙

- "CSS 잡는다"는 표현은 이 프로젝트에 해당하지 않는다. `StyleSheet` 수정이다.
- React Navigation의 내장 탭바(`tabBarStyle`, `tabBarLabelStyle` 등)는 웹에서 렌더링이 깨진다. **탭바는 커스텀 컴포넌트로 직접 그린다** (`src/components/common/BottomTabBar.tsx`).
- `localhost:8081` 웹 미리보기는 참고용. **실제 기준은 iOS 시뮬레이터 / Android 에뮬레이터**다. 웹과 네이티브 렌더링이 다를 수 있다.
- Flexbox는 기본 `flexDirection: "column"` (웹은 `row`). 헷갈리지 않도록 항상 명시한다.
- 숫자 단위에 `px` 붙이지 않는다. `{ fontSize: 14 }` (O), `{ fontSize: "14px" }` (X).

---

## 개발 컨벤션

### 패키지 매니저
- **pnpm만 사용한다.** `npm` 또는 `yarn` 사용 금지.
- 스크립트 실행: `pnpm start`, `pnpm ios`, `pnpm android`, `pnpm generate` 등

### 코드 스타일
- **쌍따옴표(`"`) 사용** (웹과 동일)
- `prettier.config.mjs` 설정 적용
- 자동 수정: `pnpm lint:fix`, `pnpm fm:fix`

### 터치 프리미티브
- **`Pressable`만 사용한다.** `TouchableOpacity` / `TouchableHighlight` 사용 금지.
- pressed 상태: `style={({ pressed }) => [styles.foo, pressed && styles.fooPressed]}`
- pressed 스타일은 보통 `opacity: 0.7~0.85` 또는 `backgroundColor` 변경.

```tsx
// ✅ 올바른 사용
<Pressable
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="설명"
>
  <Text>버튼</Text>
</Pressable>

// ❌ 사용 금지
<TouchableOpacity onPress={handlePress}>...</TouchableOpacity>
```

### 컬러 시스템
- **모든 색상 값은 `src/lib/colors.ts`의 `Colors` 토큰을 사용한다.**
- 파일 안에 `"#XXXXXX"` 형태의 하드코딩 색상 값 금지.
- `Colors`에 없는 색이 필요하면 `colors.ts`에 먼저 토큰을 추가하고 사용한다.

```tsx
// ✅ 올바른 사용
backgroundColor: Colors.brand.green,
color: Colors.text.secondary,

// ❌ 금지
backgroundColor: "#4A7C1F",
color: "#666",
```

**토큰 카테고리 요약:**

| 카테고리 | 설명 |
|----------|------|
| `Colors.brand.*` | 그린 계열 (green, greenDark, greenLight, greenMid, greenSurface) |
| `Colors.action.*` | 옐로 계열 (yellow, yellowLight, yellowDark, yellowDeep) |
| `Colors.text.*` | 텍스트 (primary, secondary, tertiary, white) |
| `Colors.bg.*` | 배경 (default, white, card, muted) |
| `Colors.border.*` | 테두리 (input, button) |
| `Colors.semantic.*` | 시맨틱 (danger) |
| `Colors.disabled.*` | 비활성화 (bg, text) |
| `Colors.divider` | 구분선 |
| `Colors.tab.*` | 탭바 전용 |

### 타입 위치
- 화면 컴포넌트 파일에서 도메인 타입을 `export`하지 않는다.
- API 응답·도메인 데이터 타입은 `src/types/` 에 둔다.
- orval 생성 타입은 `src/api/generated/` 에 있으며 직접 수정 금지.

```ts
// ✅ 올바른 위치
// src/types/word.ts
export type ExtractWordItem = { ... };

// ❌ 금지: 화면 파일에서 도메인 타입 export
// app/extract-result.tsx
export type ExtractWordItem = { ... };
```

### 탭 설정 관리
- 탭 아이콘·레이블은 **`src/components/common/BottomTabBar.tsx`의 `TAB_CONFIG`에서만** 관리한다.
- `(tabs)/_layout.tsx`의 `Tabs.Screen`에 `tabBarIcon`을 추가하지 않는다 (커스텀 탭바가 무시함).
- 탭을 추가할 때: `TAB_CONFIG`에 항목 추가 → `_layout.tsx`에 `Tabs.Screen` 추가 (title만).

### 커밋 메시지
```
{type}({scope}): {한국어 설명}
```
- type: `feat` / `fix` / `refactor` / `docs` / `test` / `chore`
- scope: 도메인명 또는 레이어명 (영어)
- 예시: `feat(auth): 구글 로그인 화면 구현`

### 웹(pickca-web) 대비 주요 차이점

| 항목 | 웹 | 앱 |
|------|----|----|
| 스토리지 | localStorage + obfuscate | expo-secure-store (Keychain/Keystore) |
| Client-Type 헤더 | `X-Client-Type: WEB` | `X-Client-Type: APP` |
| 라우팅 | Next.js App Router | Expo Router v4 |
| UI 라이브러리 | MUI | React Native Paper |
| 환경변수 접두사 | `NEXT_PUBLIC_` | `EXPO_PUBLIC_` |
| Google 로그인 | `@react-oauth/google` (브라우저 SDK) | `@react-native-google-signin/google-signin` |
| PDF | `@react-pdf/renderer` | 해당 없음 |

---

## 컴포넌트 컨벤션

### Export 규칙

| 파일 위치 | Export 방식 | 이유 |
|-----------|-------------|------|
| `app/**/*.tsx` (화면) | `export default function` | Expo Router가 default export를 라우트로 인식 |
| `src/components/**/*.tsx` | `export function` (named) | 배럴 re-export 없이 직접 import, 이름 추적 용이 |

### Props 인터페이스

```tsx
// 컴포넌트 바로 위에 interface로 정의
interface QuickActionCardProps {
  variant: "wordbook" | "study";
  count: number;
  onPress?: () => void;
}

export function QuickActionCard({ variant, count, onPress }: QuickActionCardProps) { ... }
```

- 해당 파일에서만 쓰는 타입은 같은 파일에 정의 — 별도 `types.ts` 만들지 않는다
- `type`이 아닌 `interface` 사용 (extends 가능, 오류 메시지 명확)
- 여러 파일에서 공유하는 타입은 가장 가까운 도메인 파일에 정의

### StyleSheet 위치

```tsx
export function MyComponent() { ... }

// 항상 파일 맨 아래, 하나만
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "column" },
  title: { fontSize: 16, fontWeight: "700" },
});
```

- `StyleSheet.create({})` 파일당 하나, 맨 아래에 위치
- key는 camelCase
- **인라인 스타일 금지** — 동적 값 합성만 예외:
  ```tsx
  // ✅ 동적 합성 — 허용
  <View style={[styles.wrapper, { paddingTop: insets.top }]} />

  // ❌ 정적 인라인 — 금지
  <View style={{ flex: 1, backgroundColor: Colors.bg.white }} />
  ```

### 상수/설정 객체

컴포넌트별 고정 설정은 UPPER_SNAKE_CASE 상수 객체를 **컴포넌트 외부 파일 상단**에 정의한다.

```tsx
const TAB_CONFIG: Record<string, { label: string; icon: string; activeIcon: string }> = {
  index: { label: "홈", icon: "home-outline", activeIcon: "home" },
  extract: { label: "단어 추출", icon: "text-box-plus-outline", activeIcon: "text-box-plus" },
};

export function BottomTabBar() {
  const config = TAB_CONFIG[route.name]; // 파악하기 쉬움, 테스트 가능
  ...
}
```

---

## 터치 이벤트 컨벤션

**`Pressable`만 사용한다. `TouchableOpacity`, `TouchableHighlight` 사용 금지.**

```tsx
// ✅ 올바른 방법
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
  onPress={handlePress}
  hitSlop={12}                             // 작은 버튼의 탭 영역 확장
  accessibilityRole="button"               // 필수
  accessibilityLabel="단어 추출하기"        // 필수
>
  <Text>단어 추출하기</Text>
</Pressable>

// ❌ 금지
<TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
  ...
</TouchableOpacity>
```

pressed 피드백: `opacity: 0.85` 정도의 `pressedButton` 스타일을 항상 준비.

---

## 색상 컨벤션

```tsx
// ✅ 올바른 방법
backgroundColor: Colors.brand.green
color: Colors.text.secondary

// ❌ 금지 — 하드코딩 색상
backgroundColor: "#4A7C1F"
color: "#666"
```

- 모든 색상은 `src/lib/colors.ts`의 `Colors` 상수를 사용한다
- `DESIGN.md`에 정의되지 않은 색상이 필요하면 먼저 `colors.ts`에 추가 후 사용

---

## 상태 관리 원칙

| 상태 종류 | 방법 |
|-----------|------|
| 서버 데이터 (목록, 상세) | `useQuery` (React Query) |
| 서버 변경 (생성, 수정) | `useMutation` (React Query) |
| UI 상태 (모달 visible, 입력값) | `useState` |
| 전역 인증 | `useAuth()` — `AuthContext` |

- **Zustand, Jotai, Redux 등 추가 전역 상태 라이브러리 추가 금지**
- 서버 데이터는 절대 `useState`에 직접 담지 않는다 — React Query 캐시가 정답
- 화면 간 데이터 전달은 router params 사용 (전역 상태 남발 금지)

---

## 화면 레이아웃 패턴

```tsx
// 탭 화면 — AppHeader가 상단 safe area 내부 처리
export default function ExtractScreen() {
  const insets = useSafeAreaInsets();
  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarApproxHeight + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        ...
      </ScrollView>
    </View>
  );
}

// 탭 외부 화면 (모달형) — 직접 safe area 처리
export default function ExtractResultScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>...</View>
      ...
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>...</View>
    </View>
  );
}
```

- `SafeAreaView` 직접 사용 시 `edges` 명시: `edges={["bottom"]}` 또는 `edges={["top"]}`
- 하단 safe area: `Math.max(insets.bottom, N)` 패턴 — 최소값 보장

---

## 에러 처리 패턴

```tsx
// 간단한 오류 알림 — 네이티브 Alert
Alert.alert("오류", "로그인에 실패했어요.");

// 사용자 액션이 필요한 경우 — AlertDialog 컴포넌트
const [alertDialog, setAlertDialog] = useState({ visible: false, title: "" });
showAlertDialog({ title: "단어가 추출되지 않았어요", actionLabel: "다시 시도하기" });

// 네트워크 오류 분기
import { isLikelyNetworkError } from "@/lib/wordExtraction";
catch (e) {
  if (isLikelyNetworkError(e)) {
    showAlertDialog({ title: "연결에 실패했어요", description: "네트워크를 확인해 주세요." });
    return;
  }
  ...
}

// async 핸들러 기본 패턴
const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await doSomething();
  } catch (e) {
    // 에러 처리
  } finally {
    setIsSubmitting(false); // 반드시 finally에서 해제
  }
};
```

---

## 화면 간 데이터 전달

```tsx
// 단순 값
router.push({ pathname: "/detail", params: { id: "123" } });

// 객체·배열 — JSON 직렬화
router.push({
  pathname: "/extract-result",
  params: { words: JSON.stringify(mappedWords) },
});

// 수신측
const { words: wordsParam } = useLocalSearchParams<{ words?: string }>();
const words = wordsParam ? (JSON.parse(wordsParam) as ExtractWordItem[]) : [];
```

---

## ScrollView + 키보드 처리

```tsx
// ScrollView 안에 Pressable / TextInput이 있을 때 — 필수
<ScrollView keyboardShouldPersistTaps="handled">...</ScrollView>

// 멀티라인 TextInput — Android 텍스트 상단 정렬
<TextInput multiline textAlignVertical="top" />
```

---

## 아이콘

```tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";

// 타입 추론 실패 시 as never 허용
<MaterialCommunityIcons name={iconName as never} size={24} color={color} />
```

- `@expo/vector-icons`의 `MaterialCommunityIcons`만 사용
- 다른 아이콘 패키지 추가 금지

---

## 개발 전용 코드

```tsx
// 개발 전용 UI — 프로덕션 빌드에서 자동 제거
{__DEV__ && (
  <Pressable onPress={() => router.push("/extract-result")}>
    <Text>추출 결과 미리보기 (개발 전용)</Text>
  </Pressable>
)}

// 목업 데이터 — MOCK_ prefix, API 연동 시 제거·교체
const MOCK_WORDS: WordItem[] = [{ id: "1", lemma: "mesmerizing", ... }];
const initialWords = wordsParam ? JSON.parse(wordsParam) : __DEV__ ? MOCK_WORDS : [];
```

---

## Design System

UI·시각 작업 전에 **`DESIGN.md`**를 읽는다. 색·간격·모션·레이아웃 원칙은 여기에 정의한다.
`src/lib/colors.ts` / `src/lib/theme.ts`와 충돌하면 먼저 `DESIGN.md`와 맞출지 결정한 뒤 수정한다.
