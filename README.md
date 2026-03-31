# Pickca App

픽카 모바일 앱(Expo + React Native) 개발용 안내 문서입니다.

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
```

## 설정 후 실행

환경 변수 변경 후에는 번들러/앱을 재시작해야 반영됩니다.

```bash
# 기존 실행 중이면 Ctrl+C
pnpm ios
```

## `npx expo run:ios`는 언제 쓰나?

- 보통은 **최초 1회** 실행하면 됩니다. (개발 빌드 앱 설치)
- 이후 일반 개발은 `pnpm ios`로 진행합니다.

### 다시 `npx expo run:ios`가 필요한 경우

- `app.json`의 iOS 네이티브 설정 변경 (예: `ios.bundleIdentifier`, 권한, 플러그인)
- 네이티브 라이브러리 추가/업데이트
- `ios/` 프로젝트 변경 또는 Pod 관련 변경
- 시뮬레이터/기기에서 개발 빌드 앱을 삭제한 경우

현재 프로젝트처럼 Bundle ID를 변경했다면 `npx expo run:ios`를 한 번 다시 실행해야 합니다.

## 자주 발생하는 로그인 오류

- `로그인 중 오류가 발생했습니다`
  - `.env` 누락 또는 iOS/Web Client ID 오설정 가능성이 큽니다.
- iOS에서 로그인 실패
  - Google Cloud Console의 iOS OAuth Client Bundle ID와 `app.json`의 `ios.bundleIdentifier`가 일치하는지 확인하세요.
