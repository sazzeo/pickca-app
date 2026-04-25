# Changelog

## [0.2.0] - 2026-04-25

### 추가
- `feat(profile)`: 설정 화면 UI 구현 — 닉네임 변경, 앱 버전, 서비스 약관, 계정(탈퇴/로그아웃) 섹션
- `feat(wordbook)`: 단어 카드 목록에 학습 상태 표시 및 필터 적용 (전체/학습 전/학습 중/외움)
- `chore(test)`: jest-expo + testing-library 테스트 환경 세팅 (ProfileScreen 4개 테스트)

### 수정
- `fix(word-card)`: findDOMNode 경고 수정 — useAnimatedRef로 ref 직접 전달
- `fix(common)`: EllipsisDropdownMenu 중첩 button 경고 수정

### 리팩터
- `refactor(word-card)`: URL 직렬화 대신 wordbookId로 API 직접 호출
- `refactor(wordbook)`: pointerEvents 및 카드 구조 개선 (접근성·레이아웃)

### 기타
- `chore(cleanup)`: 미사용 코드 제거 및 컨벤션 정리
- `chore(extract)`: 추출 결과 화면 미리보기 개발 전용 코드 제거
- `chore(format)`: prettier 전체 파일 일괄 포맷

## [0.1.1] - 이전 릴리스

초기 기능 구현 (단어장, 추출, 플래시카드 학습).
