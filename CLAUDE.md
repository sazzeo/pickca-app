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

- **생성 명령**: `npm run generate` (Spring API가 `localhost:8200`에서 실행 중이어야 함)
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
├── _layout.tsx           # 루트 레이아웃 (QueryClient, PaperProvider, AuthProvider)
├── index.tsx             # 진입점 → 인증 여부에 따라 리다이렉트
├── (auth)/
│   ├── _layout.tsx       # 비인증 Guard (로그인 상태면 탭으로 리다이렉트)
│   └── sign-in.tsx       # 소셜 로그인 화면
└── (tabs)/
    ├── _layout.tsx        # 인증 Guard + 탭바 (미인증이면 로그인으로 리다이렉트)
    ├── index.tsx          # 단어장 탭
    ├── quiz.tsx           # 퀴즈 탭
    └── profile.tsx        # 프로필·로그아웃 탭
```

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
   - iOS Client ID (Bundle ID: `com.pickca.app`)
   - Android Client ID (Package: `com.pickca.app`, SHA-1 지문 필요)
   - Web Client ID (Expo Go 테스트 및 Android 토큰 검증용)
2. `.env`에 각 Client ID 입력

---

## 개발 컨벤션

### 패키지 매니저
- **pnpm만 사용한다.** `npm` 또는 `yarn` 사용 금지.
- 스크립트 실행: `pnpm start`, `pnpm ios`, `pnpm android`, `pnpm generate` 등

### 코드 스타일
- **쌍따옴표(`"`) 사용** (웹과 동일)
- `prettier.config.mjs` 설정 적용
- 자동 수정: `pnpm lint:fix`, `pnpm fm:fix`

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

## Design System

UI·시각 작업 전에 **`DESIGN.md`**를 읽는다. 색·간격·모션·레이아웃 원칙은 여기에 정의한다.  
`src/lib/colors.ts` / `src/lib/theme.ts`와 충돌하면 먼저 `DESIGN.md`와 맞출지 결정한 뒤 수정한다.
