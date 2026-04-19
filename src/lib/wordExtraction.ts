import axios from "axios";

import type { WordResponse } from "@/api/generated/pickcaAPI.schemas";
import type { ExtractWordItem } from "@/types/word";

const POS_SHORT: Record<string, string> = {
  NOUN: "n", VERB: "v", ADJECTIVE: "adj", ADVERB: "adv",
  PREPOSITION: "prep", CONJUNCTION: "conj", INTERJECTION: "interj", PRONOUN: "pron",
};

/** WordResponse → ExtractWordItem 변환 */
export function mapWord(w: WordResponse): ExtractWordItem {
  const first = w.meanings[0];
  return {
    id: w.word,
    wordId: typeof w.id === "number" ? w.id : undefined,
    lemma: w.word,
    meaningKo: w.primaryMeanings ?? first?.koreanPrimary ?? "—",
    pos: POS_SHORT[first?.partOfSpeech ?? ""] ?? "?",
    pronunciation: w.phonetic ? `[ ${w.phonetic} ]` : "",
    collectStatus: w.collectStatus,
  };
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
