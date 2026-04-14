/**
 * 이메일 기반 임시 사용자 식별값 생성.
 * 백엔드에서 memberId를 직접 내려주지 않는 구간의 안전한 폴백으로 사용한다.
 */
export function createMemberIdFromEmail(email: string): number {
  const normalizedEmail = email.trim().toLowerCase();
  let hash = 0;

  for (let index = 0; index < normalizedEmail.length; index += 1) {
    hash = (hash * 31 + normalizedEmail.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) || 1;
}
