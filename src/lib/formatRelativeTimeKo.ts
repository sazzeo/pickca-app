/**
 * ISO 8601 날짜 문자열을 한국어 상대 시간 문자열로 변환한다.
 */
export function formatRelativeTimeKo(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) {
    return "";
  }
  const diffMs = Date.now() - then;
  if (diffMs < 0) {
    return "방금 전";
  }
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  if (day >= 7) {
    const d = new Date(isoDate);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }
  if (day >= 1) {
    return `${day}일 전`;
  }
  if (hour >= 1) {
    return `${hour}시간 전`;
  }
  if (min >= 1) {
    return `${min}분 전`;
  }
  return "방금 전";
}
