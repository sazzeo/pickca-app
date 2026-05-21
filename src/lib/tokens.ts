/** DESIGN.md 권장 스케일: 4, 8, 12, 16, 20, 24, 32 */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Display: 24~28sp · Body: 14~16sp · Caption: 12~13sp */
export const FontSize = {
  xs: 10,
  sm: 12,
  caption: 13,
  body: 14,
  bodyMd: 15,
  bodyLg: 16,
  section: 18,
  title: 20,
  display: 24,
  displayLg: 28,
  word: 36,
} as const;

/** DESIGN.md: 카드 16 · 버튼 8~10 */
export const Radius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  card: 16,
  modal: 20,
  full: 9999,
} as const;
