# 앱 라우팅 특이사항

> 라우팅 트리 전체는 `app/` 디렉터리 직접 탐색. 이 파일엔 코드만 봐선 알 수 없는 의도·제약만 기록.

## 탭바 미노출 화면

`(tabs)/` 안에 있지만 탭바에 표시하지 않는 화면:
- `quiz.tsx` — 미구현, 탭바 미노출 (`BottomTabBar.tsx`의 `TAB_CONFIG`에서 제외)
- `profile.tsx` — 탭바 미노출, 홈 화면 상단 아이콘에서 진입

## 탭 외부 모달형 화면

`app/` 루트에 위치, safe area를 직접 처리해야 함 (`SafeAreaView` 대신 `useSafeAreaInsets`):
- `extract-result.tsx` — 단어 추출 결과, `extract.tsx`에서 JSON params로 진입
- `word-card.tsx` — 단어 카드 스와이프, `wordbook-detail.tsx`에서 진입

## Guard 구조

- `(auth)/_layout.tsx` — 비인증 사용자만 접근, 로그인 후 `/(tabs)/`로 리다이렉트
- `(tabs)/_layout.tsx` — 인증 사용자만 접근, 미인증 시 `/(auth)/sign-in`으로 리다이렉트
- `index.tsx` — 진입점, 인증 여부 확인 후 리다이렉트만 담당 (UI 없음)
