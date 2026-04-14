import axios from "axios";

/** 네트워크 실패(응답 없음 등) 여부 — Alert 분기용 */
export function isLikelyNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return (
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      (!error.response && !!error.request)
    );
  }
  return false;
}
