# Pickca App

픽카 모바일 앱(Expo + React Native) 개발용 안내 문서입니다.

## 문서

| 파일 | 내용 |
|------|------|
| [AGENTS.md](./AGENTS.md) | AI 에이전트용 규칙·스택 |
| [CLAUDE.md](./CLAUDE.md) | 개발 컨벤션·인증·라우팅 |
| [DESIGN.md](./DESIGN.md) | 디자인 시스템(색·간격·모션) |

## Google 로그인 설정 (iOS 개발 빌드 기준)

`@react-native-google-signin/google-signin`은 네이티브 SDK를 사용하므로, 개발 빌드(`pnpm ios`, `npx expo run:ios`)에서는 **iOS Client ID**가 반드시 필요합니다.

### 왜 Client ID가 iOS/Android/Web로 나뉘나?

- iOS Client ID: iOS 앱(번들 ID 기준)에서 구글 로그인 UI를 열 때 사용
- Android Client ID: Android 앱(패키지명 + SHA-1 기준)에서 사용
- Web Client ID: 백엔드(Spring)에서 `idToken` 검증 시 사용

즉, 개발 빌드 기준으로는 보통 `iOS Client ID + Web Client ID` 2개가 필요합니다.

## 현재 앱 식별자

- iOS Bundle ID: `cloud.pickca.app`
- Android Package: `cloud.pickca.app`

Google Cloud Console에서 iOS OAuth Client 생성 시 Bundle ID도 `cloud.pickca.app`으로 맞춰야 합니다.

## 환경 변수

`.env` 파일에 아래 값을 채워주세요.

```bash
EXPO_PUBLIC_API_URL=http://localhost:8200
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...

# 개발용 이메일 로그인 (Expo Go / 웹 미리보기 전용)
EXPO_PUBLIC_EXPO_GO_DEV_LOGIN=1
```

## 개발용 이메일 로그인

Expo Go 또는 `pnpm start` 웹 미리보기(`localhost:8081`)에서는 네이티브 Google SDK를 쓸 수 없습니다. 이때 소셜 인증 없이 이메일만으로 바로 로그인할 수 있습니다.

**조건:**
1. Spring API 서버가 `local` 프로파일로 실행 중이어야 합니다 (`./gradlew :api:bootRun`)
2. `.env`에 `EXPO_PUBLIC_EXPO_GO_DEV_LOGIN=1` 설정
3. 입력하는 이메일이 DB에 존재해야 합니다 (없으면 오류 알림)

로그인 성공 시 실제 JWT(access/refresh token)가 발급됩니다. dev 전용 더미 토큰이 아닙니다.

## 설정 후 실행

환경 변수 변경 후에는 번들러/앱을 재시작해야 반영됩니다.

**Metro(번들러)** 는 보통 아래처럼 켠다.

```bash
pnpm start
```

번들 캐시 때문에 이상하면 Metro 캐시를 비우고 다시 켠다. (`npx expo start --clear`와 동일)

```bash
pnpm start:clear
```

**앱을 다시 빌드해 설치**할 때는 플랫폼별로 다음을 쓴다.

```bash
# 기존 실행 중이면 Ctrl+C
pnpm ios
# Android
pnpm android
```

## Orval API 코드 생성

`orval` 생성 명령은 아래와 같습니다.

```bash
pnpm generate
```

실행 전에 Spring API 서버가 `http://localhost:8200`에서 켜져 있어야 하며, 생성 결과는 `src/api/generated/`에 반영됩니다. 생성 코드는 저장소에 포함되어 있으므로, OpenAPI 스펙이 바뀐 뒤에는 `pnpm generate`로 갱신한 다음 변경분을 커밋하면 됩니다.

## Android Studio에서 실행

1. **Android Studio**를 연다.
2. 상단 메뉴 **Tools → Device Manager**(또는 홈 화면의 **Device Manager**)를 연다.
3. 사용할 가상 기기(AVD) 옆 **재생(▶)** 버튼으로 에뮬레이터를 켠다. (기기가 없으면 **Create Device**로 새 AVD를 만든다.)
4. 에뮬레이터가 부팅된 뒤, 프로젝트 루트 터미널에서 아래를 실행한다.

```bash
pnpm android
```

`expo run:android`가 연결된 에뮬레이터(또는 USB로 연결된 기기)에 개발 빌드를 설치하고 실행한다. Metro는 보통 **다른 터미널**에서 `pnpm start` 또는 `pnpm start:clear`로 켜 두면 된다.

네이티브 프로젝트만 Android Studio에서 열어 보고 싶다면(Gradle 동기화·로그캣 등), 저장소에 `android/`가 있을 때 **File → Open**으로 `pickca-app/android` 폴더를 연다. (`android/`는 `expo prebuild` 등으로 생성된다.)

## `npx expo run:ios`는 언제 쓰나?

- 보통은 **최초 1회** 실행하면 됩니다. (개발 빌드 앱 설치)
- 이후 일반 개발은 `pnpm ios`로 진행합니다.

### 다시 `npx expo run:ios`가 필요한 경우

- `app.config.ts`의 iOS 네이티브 설정 변경 (예: `ios.bundleIdentifier`, 권한, 플러그인)
- 네이티브 라이브러리 추가/업데이트
- `ios/` 프로젝트 변경 또는 Pod 관련 변경
- 시뮬레이터/기기에서 개발 빌드 앱을 삭제한 경우

현재 프로젝트처럼 Bundle ID를 변경했다면 `npx expo run:ios`를 한 번 다시 실행해야 합니다.

## 자주 발생하는 로그인 오류

- `로그인 중 오류가 발생했습니다`
  - `.env` 누락 또는 iOS/Web Client ID 오설정 가능성이 큽니다.
- iOS에서 로그인 실패
  - Google Cloud Console의 iOS OAuth Client Bundle ID와 `app.config.ts`의 `ios.bundleIdentifier`가 일치하는지 확인하세요.
