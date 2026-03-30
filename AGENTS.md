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
│   ├── (auth)/
│   │   ├── _layout.tsx         # 비인증 Guard
│   │   └── sign-in.tsx         # 소셜 로그인 화면
│   └── (tabs)/
│       ├── _layout.tsx         # 인증 Guard + 탭바
│       ├── index.tsx           # 단어장 탭
│       ├── quiz.tsx            # 퀴즈 탭
│       └── profile.tsx         # 프로필·로그아웃 탭
├── src/
│   ├── api/
│   │   └── generated/          # orval 생성 파일 — 직접 수정 금지
│   ├── contexts/
│   │   └── AuthContext.tsx     # 전역 인증 상태
│   └── lib/
│       ├── axios.ts            # axiosInstance + fetcher (orval mutator)
│       ├── storage.ts          # SecureStore 토큰 관리
│       └── theme.ts            # React Native Paper 테마
├── assets/                     # 이미지·폰트
├── app.json                    # Expo 설정
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

## 금지 사항

- `src/api/generated/` 파일 직접 수정 금지 — `pnpm generate`로 재생성
- `axiosInstance`를 직접 호출하여 API 요청 금지 — orval 생성 훅 사용
- `src/lib/axios.ts`의 토큰 갱신 로직을 orval 훅으로 교체 금지 — 인터셉터 무한루프 발생
- `window`, `localStorage` 등 웹 전용 API 사용 금지
- `npm install` 또는 `yarn add`로 패키지 추가 금지 — `pnpm add` 사용

---

## 체크리스트 (코드 작성 후 검증)

- [ ] API 호출 시 orval 생성 훅을 사용하는가
- [ ] 토큰 접근 시 `src/lib/storage.ts`의 함수를 사용하는가
- [ ] SecureStore 호출에 `await`가 빠짐없이 붙어 있는가
- [ ] 브라우저 전용 API(`window`, `localStorage`)가 사용되지 않는가
- [ ] 새 화면 추가 시 인증 Guard가 적용된 레이아웃 안에 배치되었는가
- [ ] 환경변수 접두사가 `EXPO_PUBLIC_`인가
- [ ] 주석이 한국어로 작성되었는가
