# Pickca App — AGENTS.md

이 파일은 AI 에이전트가 이 프로젝트에서 코드를 생성·수정할 때 따라야 할 규칙과 컨텍스트를 정의한다.

---

## 프로젝트 개요

영어 텍스트에서 단어를 추출해 단어장을 만들고, 플래시카드·퀴즈로 암기하는 서비스의 **모바일 앱**.

- **이 앱**: 단어장 암기·퀴즈 (핵심 기능)
- **웹(`../web`)**: 텍스트 붙여넣기 → 단어 추출 → 저장 + 어드민
- **API(`../api`)**: Spring Boot — OAuth2, 비즈니스 로직 전담

---

## 기술 스택 (고정)

| 항목 | 값 |
|---|---|
| 프레임워크 | Expo SDK 52 + Expo Router v4 |
| 언어 | TypeScript |
| UI | React Native Paper (Material Design 3) |
| 상태 관리 | @tanstack/react-query v5 |
| HTTP 클라이언트 | axios |
| API 코드 생성 | orval (devDependency) |
| 토큰 저장 | expo-secure-store |
| 패키지 매니저 | pnpm |

> 위 스택은 변경하지 않는다. 임의로 다른 라이브러리를 추가하지 않는다.

---

## 프로젝트 구조

```
pickca-app/
├── app/                        # Expo Router 페이지 (Next.js App Router와 동일 패턴)
│   ├── _layout.tsx             # 루트 레이아웃 (QueryClient, PaperProvider, AuthProvider)
│   ├── index.tsx               # 진입점 → 인증 여부에 따라 리다이렉트
│   ├── extract-result.tsx      # 단어 추출 결과 화면 (탭 외부 화면)
│   ├── (auth)/
│   │   ├── _layout.tsx         # 비인증 Guard
│   │   └── sign-in.tsx         # 소셜 로그인 화면
│   └── (tabs)/
│       ├── _layout.tsx         # 인증 Guard + 탭바
│       ├── index.tsx           # 홈 탭
│       ├── extract.tsx         # 단어 추출 탭
│       ├── wordbook.tsx        # 단어장 탭
│       ├── study.tsx           # 학습 탭
│       ├── quiz.tsx            # 퀴즈 화면 (탭바 미노출)
│       └── profile.tsx         # 프로필·로그아웃 화면 (탭바 미노출)
├── src/
│   ├── api/
│   │   └── generated/          # orval 생성 파일 — 직접 수정 금지
│   ├── components/
│   │   ├── auth/               # 인증 관련 컴포넌트 (GoogleSignInPanel 등)
│   │   ├── common/             # 공통 컴포넌트 (AppHeader 등)
│   │   └── home/               # 홈 화면 컴포넌트 (ExtractionCard, GreetingSection 등)
│   ├── contexts/
│   │   └── AuthContext.tsx     # 전역 인증 상태
│   └── lib/
│       ├── axios.ts            # axiosInstance + fetcher (orval mutator)
│       ├── colors.ts           # 색상 상수
│       ├── storage.ts          # SecureStore 토큰 관리
│       ├── theme.ts            # React Native Paper 테마
│       └── wordExtraction.ts   # 단어 추출 API 호출 유틸
├── assets/                     # 이미지·폰트
├── app.config.ts               # Expo 설정
├── orval.config.ts             # API 코드 생성 설정
└── CLAUDE.md                   # Claude/Cursor용 상세 가이드
```

---

## API 연동 규칙

### orval 생성 훅 사용 원칙

```ts
// ❌ 금지 — axiosInstance 직접 호출
const res = await axiosInstance.post('/api/auth/social/google', { idToken });

// ✅ 올바른 방법 — orval 생성 훅 사용
import { useGoogleLogin } from '@/api/generated/auth/auth';
const { mutateAsync: googleLogin } = useGoogleLogin();
const res = await googleLogin({ data: { idToken } });
```

- **생성 명령**: `pnpm generate` (Spring API가 `localhost:8200`에서 실행 중이어야 함)
- **생성 위치**: `src/api/generated/` — Git ignore됨, 재생성 시 덮어씌워짐
- **예외**: `src/lib/axios.ts`의 토큰 갱신 로직은 인터셉터 무한루프 방지 목적으로 raw `axios` 직접 사용 — orval 훅으로 교체하지 않는다

### axios 인터셉터 동작 (`src/lib/axios.ts`)

- 모든 요청에 `X-Client-Type: APP` 헤더 자동 추가 (웹은 `WEB`)
- `Authorization: Bearer {accessToken}` 자동 첨부 (SecureStore에서 읽음)
- 401 응답 시 refresh token으로 자동 갱신 → 원래 요청 재시도
- 갱신 실패 시 토큰 삭제 + `/(auth)/sign-in`으로 리다이렉트

---

## 인증 규칙

### 토큰 저장 — `src/lib/storage.ts`

- **expo-secure-store 사용** (iOS Keychain / Android Keystore)
- 웹의 `localStorage + obfuscate` 방식 대신 사용 — 더 안전함
- 토큰은 반드시 `setTokens()`, `getAccessToken()`, `getRefreshToken()`, `clearTokens()` 함수를 통해서만 접근한다
- SecureStore는 **비동기**이므로 반드시 `await` 사용

### 인증 상태 — `AuthContext` (`src/contexts/AuthContext.tsx`)

- `useAuth()` 훅으로 인증 상태 접근
- `signIn(accessToken, refreshToken, user)` — 로그인 처리
- `signOut()` — 토큰 삭제 + 로그인 화면으로 이동

### 라우트 보호 패턴

- `(auth)/_layout.tsx` — 로그인 상태면 `/(tabs)`로 리다이렉트
- `(tabs)/_layout.tsx` — 미인증 상태면 `/(auth)/sign-in`으로 리다이렉트
- `index.tsx` — 진입 시 인증 여부 확인 후 분기

---

## 환경 변수

```bash
# .env 파일 (EXPO_PUBLIC_ 접두사 필수 — 웹의 NEXT_PUBLIC_ 에 해당)
EXPO_PUBLIC_API_URL=http://localhost:8200
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=   # Expo Go 테스트용
```

> `EXPO_PUBLIC_` 접두사가 없으면 클라이언트 번들에 포함되지 않는다.

---

## 개발 및 실행

```bash
pnpm install           # 의존성 설치
pnpm start             # Metro 번들러 시작 (QR 코드 → Expo Go 앱으로 스캔)
pnpm ios               # iOS 시뮬레이터
pnpm android           # Android 에뮬레이터
pnpm generate          # orval API 코드 생성
pnpm typecheck         # TypeScript 타입 검사
pnpm lint:fix          # ESLint 자동 수정
pnpm fm:fix            # Prettier 자동 포맷
```

---

## 코딩 규칙

- **모든 주석·에러 메시지는 한국어**로 작성한다
- **패키지 매니저는 pnpm만 사용한다** (`npm`, `yarn` 사용 금지)
- **따옴표**: 쌍따옴표(`"`) 사용
- SecureStore API는 비동기이므로 반드시 `async/await` 사용
- `window`, `localStorage`, `document` 등 브라우저 전용 API 사용 금지 — React Native에서 동작하지 않음
- 네비게이션: `router.replace()` / `router.push()` 사용 (`window.location.href` 사용 금지)

### 커밋 메시지
```
{type}({scope}): {한국어 설명}
```
- type: `feat` / `fix` / `refactor` / `docs` / `test` / `chore`
- 예시: `feat(auth): 구글 로그인 화면 구현`

---

## 컴포넌트 구조 컨벤션

### Export 규칙

```tsx
// 화면 파일 (app/**/*.tsx) — Expo Router 요구사항
export default function ExtractScreen() { ... }

// 재사용 컴포넌트 (src/components/**/*.tsx) — named export 필수
export function AppHeader({ onSettingsPress }: AppHeaderProps) { ... }
```

- `app/` 하위 화면: `export default function` (Expo Router가 default export를 라우트로 인식)
- `src/components/` 하위 컴포넌트: `export function` (named export) — 배럴 re-export 없이 직접 import

### Props 타입 정의

```tsx
// 컴포넌트 바로 위에 interface로 정의
interface AlertDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  onAction: () => void;
}

export function AlertDialog({ visible, title, ... }: AlertDialogProps) { ... }
```

- `interface {컴포넌트명}Props` 네이밍
- 해당 파일에서만 쓰는 타입은 같은 파일에 정의 — 별도 `types.ts` 파일 생성 금지

### StyleSheet 위치

```tsx
export function MyComponent() { ... }

// 항상 파일 맨 아래에 한 번만 선언
const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700" },
});
```

- `StyleSheet.create({})` 블록은 파일당 하나, 파일 맨 아래에 위치
- 스타일 key는 camelCase
- 인라인 스타일 `style={{ ... }}` 금지 — 동적 값 합성만 예외:
  ```tsx
  // ✅ 허용 — 동적 값과 정적 스타일 합성
  <View style={[styles.wrapper, { paddingTop: insets.top }]} />

  // ❌ 금지 — 정적 스타일을 인라인으로
  <View style={{ flex: 1, backgroundColor: "#fff" }} />
  ```

### 상수/설정 객체

```tsx
// 컴포넌트 외부, 파일 상단에 UPPER_SNAKE_CASE로 정의
const TAB_CONFIG: Record<string, { label: string; icon: string }> = {
  index: { label: "홈", icon: "home-outline" },
  extract: { label: "단어 추출", icon: "text-box-plus-outline" },
};

export function BottomTabBar() {
  const config = TAB_CONFIG[route.name];
  ...
}
```

---

## 터치 이벤트 컨벤션

**신규 코드는 `Pressable`만 사용한다.** `TouchableOpacity`, `TouchableHighlight` 사용 금지.

```tsx
// ✅ 올바른 방법
<Pressable
  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
  onPress={handlePress}
  hitSlop={12}
  accessibilityRole="button"
  accessibilityLabel="단어 추출하기"
>
  <Text>단어 추출하기</Text>
</Pressable>

// ❌ 금지
<TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
  <Text>단어 추출하기</Text>
</TouchableOpacity>
```

- pressed 피드백: `({ pressed }) => [styles.btn, pressed && styles.btnPressed]` 패턴
- 작은 버튼 탭 영역 확장: `hitSlop={12}`
- **모든 Pressable에 `accessibilityRole` + `accessibilityLabel` 필수**

---

## 색상 컨벤션

```tsx
// ✅ 올바른 방법
backgroundColor: Colors.brand.green

// ❌ 금지 — 하드코딩 색상
backgroundColor: "#4A7C1F"
```

- 모든 색상은 `src/lib/colors.ts`의 `Colors` 상수를 사용한다
- `DESIGN.md`에 없는 색상이 필요하면 먼저 `colors.ts`에 추가하고 사용

---

## 상태 관리 원칙

| 상태 종류 | 방법 |
|-----------|------|
| 서버 데이터 (목록, 상세) | `useQuery` (React Query) |
| 서버 변경 (생성, 수정, 삭제) | `useMutation` (React Query) |
| UI 상태 (모달 visible, 입력값 등) | `useState` |
| 전역 인증 상태 | `useAuth()` — `AuthContext` |

- **Zustand, Jotai, Redux 등 추가 전역 상태 라이브러리 추가 금지**
- 서버 데이터는 절대 `useState`에 직접 담지 않는다 — React Query 캐시가 정답

---

## 화면 레이아웃 패턴

```tsx
// 탭 화면 — 상단 safe area를 AppHeader 내부에서 처리
export default function ExtractScreen() {
  const insets = useSafeAreaInsets();
  const tabBarApproxHeight = 60 + Math.max(insets.bottom, 10);

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarApproxHeight + 24 }}
      >
        ...
      </ScrollView>
    </View>
  );
}

// 탭 외부 화면 (modal 등) — 직접 safe area 처리
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

- `SafeAreaView`를 직접 쓸 때는 `edges` 명시 (`edges={["bottom"]}`, `edges={["top"]}`)
- 상단 safe area는 주로 `useSafeAreaInsets().top`으로 헤더에 적용
- 하단 safe area는 탭바 또는 footer에 `Math.max(insets.bottom, N)` 패턴

---

## 에러 처리 패턴

```tsx
// 간단한 오류 — Alert.alert (네이티브 OS 알림)
Alert.alert("오류", "로그인에 실패했어요.");

// 사용자 확인이 필요한 흐름 — AlertDialog 컴포넌트
const [alertDialog, setAlertDialog] = useState({ visible: false, title: "" });
showAlertDialog({ title: "단어가 추출되지 않았어요", actionLabel: "다시 시도하기" });

// 네트워크 오류 분기
import { isLikelyNetworkError } from "@/lib/wordExtraction";
if (isLikelyNetworkError(error)) {
  // 네트워크 오류 메시지
}
```

- async 핸들러는 반드시 `try-catch-finally` — `finally`에서 로딩 상태 해제
- 중복 API 호출 방지: `const [isSubmitting, setIsSubmitting] = useState(false)` + `disabled={isSubmitting}`

---

## 화면 간 데이터 전달

```tsx
// 단순 값 — router params
router.push({ pathname: "/detail", params: { id: "123" } });

// 객체·배열 — JSON.stringify → useLocalSearchParams → JSON.parse
router.push({
  pathname: "/extract-result",
  params: { words: JSON.stringify(mappedWords) },
});

// extract-result.tsx에서 수신
const { words: wordsParam } = useLocalSearchParams<{ words?: string }>();
const words = wordsParam ? (JSON.parse(wordsParam) as ExtractWordItem[]) : [];
```

- 전역 상태(Zustand 등) 없이 params로 전달 — AuthContext 제외
- params는 문자열만 가능 → 객체/배열은 항상 JSON 직렬화

---

## ScrollView + 키보드 처리

```tsx
// ScrollView 안에 Pressable / 입력 필드가 있을 때
<ScrollView keyboardShouldPersistTaps="handled">
  <TextInput ... />
  <Pressable onPress={...}>...</Pressable>
</ScrollView>

// 멀티라인 TextInput — Android 텍스트 정렬
<TextInput multiline textAlignVertical="top" ... />
```

---

## 아이콘 사용

```tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";

// 타입 오류 시 as never 캐스트 허용
<MaterialCommunityIcons name={iconName as never} size={24} color={color} />
```

- `@expo/vector-icons`의 `MaterialCommunityIcons`만 사용
- 다른 아이콘 패키지 추가 금지

---

## 개발 전용 코드

```tsx
// __DEV__ 블록 — 프로덕션 빌드에서 자동 제거
{__DEV__ && (
  <Pressable onPress={() => router.push("/extract-result")}>
    <Text>추출 결과 미리보기 (개발 전용)</Text>
  </Pressable>
)}

// 목업 데이터 — MOCK_ prefix 사용, API 연동 시 제거·교체
const MOCK_WORDS: WordItem[] = [{ ... }];
```

---

## 금지 사항

- `src/api/generated/` 파일 직접 수정 금지 — `pnpm generate`로 재생성
- `axiosInstance`를 직접 호출하여 API 요청 금지 — orval 생성 훅 사용
- `src/lib/axios.ts`의 토큰 갱신 로직을 orval 훅으로 교체 금지 — 인터셉터 무한루프 발생
- `window`, `localStorage` 등 웹 전용 API 사용 금지
- `npm install` 또는 `yarn add`로 패키지 추가 금지 — `pnpm add` 사용

---

## 체크리스트 (코드 작성 후 검증)

### API / 인증
- [ ] API 호출 시 orval 생성 훅을 사용하는가 (`axiosInstance` 직접 호출 금지)
- [ ] 토큰 접근 시 `src/lib/storage.ts`의 함수를 사용하는가
- [ ] SecureStore 호출에 `await`가 빠짐없이 붙어 있는가
- [ ] 브라우저 전용 API(`window`, `localStorage`)가 사용되지 않는가
- [ ] 환경변수 접두사가 `EXPO_PUBLIC_`인가

### 컴포넌트 / UI
- [ ] 화면 파일은 `export default function`, 컴포넌트는 `export function`인가
- [ ] `Pressable`을 사용했는가 (`TouchableOpacity` 사용 금지)
- [ ] 모든 `Pressable`에 `accessibilityRole` + `accessibilityLabel`이 있는가
- [ ] 인라인 스타일(`style={{ ... }}`)을 쓰지 않았는가 (동적 합성 제외)
- [ ] 하드코딩 색상 대신 `Colors.*`를 사용하는가
- [ ] `StyleSheet.create({})` 블록이 파일 맨 아래에 하나만 있는가
- [ ] 상수 설정 객체는 UPPER_SNAKE_CASE로 컴포넌트 외부에 정의했는가

### 레이아웃 / 상호작용
- [ ] 화면 상단/하단 safe area 처리가 되어 있는가 (`useSafeAreaInsets`)
- [ ] ScrollView 내 Pressable이 있으면 `keyboardShouldPersistTaps="handled"`가 있는가
- [ ] 멀티라인 TextInput에 `textAlignVertical="top"`이 있는가 (Android)
- [ ] 새 화면 추가 시 인증 Guard가 적용된 레이아웃 안에 배치되었는가

### 상태 관리 / 에러
- [ ] 서버 데이터를 `useState`에 직접 담지 않았는가 (React Query 사용)
- [ ] async 핸들러에 `try-catch-finally`가 있는가
- [ ] 중복 제출 방지 로직(`isSubmitting` 또는 `inFlight ref`)이 있는가

### 일반
- [ ] 주석이 한국어로 작성되었는가
- [ ] 목업 데이터·개발 전용 코드에 `MOCK_` prefix / `__DEV__` 블록이 있는가
