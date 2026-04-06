import axios from "axios";

/** 추출 API 연동 후 서버 스키마에 맞게 확장 */
export type ExtractedWordPreview = {
  lemma: string;
};

/**
 * 텍스트에서 단어 추출 요청 (연동 전 스텁)
 * 연동 시 orval 생성 훅으로 교체하고, 빈 배열·에러는 호출부에서 Alert 처리
 */
export async function requestExtractedWords(_plainText: string): Promise<ExtractedWordPreview[]> {
  await new Promise((r) => setTimeout(r, 400));
  // TODO: orval 훅으로 실제 API 호출
  return [];
}

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
