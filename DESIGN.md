# Design System — Pickca App

## Product Context

- **What this is:** 영어 텍스트에서 단어를 추출해 단어장을 만들고, 플래시카드·퀴즈로 암기하는 **React Native(Expo)** 모바일 앱.
- **Who it's for:** 영어 학습자, 짧은 세션으로 단어를 고르고 외우려는 사용자.
- **Space / industry:** EdTech, 어휘·암기 앱 (Duolingo·Anki 계열과 비교되지만 UI는 더 차분하고 **집중형**).
- **Project type:** 네이티브 모바일 앱 (탭·스택·카드 중심). 마케팅 랜딩이 아님.

## Aesthetic Direction

- **Direction:** **Organic / Calm study** — 브랜드 그린으로 “성장·누적”을 연상시키되, 과한 장식 없이 **읽기·선택·복습**에만 시선이 가게 함.
- **Decoration level:** **minimal** — 카드·리스트·진행률이 주인공. 그라데이션·장식 블롭 없음.
- **Mood:** 안정적, 산만하지 않음. **핵심 인터랙션(덱·체크)은 위치 고정**을 우선(제품 결정과 일치).
- **Reference:** 현재 구현의 `src/lib/colors.ts`, `src/lib/theme.ts`, 추출 결과·단어장 화면 목업 PNG.

## SAFE vs RISK (카테고리 대비)

**SAFE (사용자가 익숙해하는 패턴)**

- 상단 헤더 + 본문 + 하단 고정 CTA.
- Primary 단일 액센트(그린), 성공/경고는 시맨틱 색으로만 확장.
- Material 3(Paper) 컴포넌트로 접근성·터치 영역 기본 충족.

**RISK (픽카의 얼굴이 되는 선택)**

- **블루 계열 Flashcard 앱과 차별:** primary를 그린으로 고정 (`#4A7C1F`). “또 하나의 파란 학습앱” 느낌 회피.
- **품사 태그 등 보조 강조:** 액센트 옐로(`#E9B83A` / 연한 배경)로만 포인트. 남용 금지.
- **모션:** 기능적 전환만. 카드 덱은 **이동 애니 없이 텍스트만 교체**할 수 있음(제품 방향).

## Typography

- **Platform:** React Native는 기본 **시스템 폰트**(iOS: SF, Android: Roboto). 별도 폰트 로드 없이도 가독성 확보.
- **Display / 단어(lemma):** 굵게·큰 크기(예: 24~28sp)로 한눈에 들어오게.
- **Body / 뜻:** secondary 색 `#666666`, 14~16sp.
- **Caption / 보조:** `#999999`, 12~13sp.
- **향후:** 브랜드 톤을 더 쥐고 싶으면 `expo-font`로 **Plus Jakarta Sans** 또는 **Instrument Sans** 한 벌만 로드해 body에 통일(표시용 제목은 system 유지 가능).

## Color

- **Approach:** **restrained** — primary 그린 + 중성 그레이 + 옐로 포인트만.
- **Single source of truth:** `src/lib/colors.ts`와 `src/lib/theme.ts`의 `primary` / `primaryContainer`를 항상 동기화.

| 토큰 | Hex | 용도 |
|------|-----|------|
| brand.green | `#4A7C1F` | Primary, CTA, 체크(픽) |
| brand.greenDark | `#3A6218` | 탭 활성, 강조 테두리 |
| brand.greenLight | `#EEF3E4` | 배경·칩·리스트 하이라이트 |
| brand.greenMid | `#C8DDA8` | 보조 버튼·세컨더리 면 |
| action.yellow / yellowLight | `#E9B83A` / `#FDF6E0` | 품사 pill 등 소량 강조 |
| text.primary | `#1A1A1A` | 본문 |
| text.secondary | `#666666` | 부제 |
| text.tertiary | `#999999` | 캡션 |
| bg.default | `#F8F8F8` | 화면 배경 |
| divider | `#EEEEEE` | 구분선 |

- **Semantic (추후):** 성공/오류/경고는 Material `theme.colors` 확장 또는 `colors.ts`에 `semantic` 블록 추가 시 한 번에 정의.

## Spacing

- **Base unit:** **4px** (RN에서 숫자는 dp).
- **Density:** comfortable — 학습 화면은 답답하지 않게, 카드 내부는 최소 12~16dp 패딩.
- **Scale (권장):** 4, 8, 12, 16, 20, 24, 32.

## Layout

- **Approach:** **grid-disciplined** — 카드 폭, 좌우 16dp 패딩 통일.
- **고정 영역:** 추출 결과처럼 **덱 슬롯 높이 상수**로 상단 블록을 고정하고, **확인한 단어**만 `ScrollView` (전체 화면 스크롤 지양).
- **Border radius:** 카드 16, 버튼 8~10, pill 8~20 (이미 사용 중인 값 유지).

## Motion

- **Approach:** **minimal-functional** — 상태 이해에 필요한 피드백만(버튼 press opacity, 진행률 막대 변화).
- **Duration:** 짧게 150~250ms. 카드 슬라이드는 **기본값 없음**(제품에서 명시할 때만 추가).

## Anti-slop (이 앱에서 피할 것)

- 보라·남색 그라데이션 히어로, 3열 아이콘 그리드 “기능 소개”.
- 장식용 큰 일러스트로 시선 분산.
- 모든 화면 중앙 정렬 + 동일한 큰 라운드만 반복.

## Implementation Map

| 영역 | 파일 / 위치 |
|------|-------------|
| 컬러 토큰 | `src/lib/colors.ts` |
| Paper 테마 | `src/lib/theme.ts` |
| 스크린 | `app/`, `src/components/` |

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-07 | 초기 DESIGN.md 작성 | `/design-consultation` — 기존 그린 팔레트·고정 덱·히스토리 스크롤 UX를 문서화 |
