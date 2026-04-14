import type { WordResponseCollectStatus } from "@/api/generated/pickcaAPI.schemas";

/** 단어 추출 결과 아이템 */
export type ExtractWordItem = {
  id: string;
  lemma: string;
  meaningKo: string;
  pos: string;
  pronunciation: string;
  collectStatus: WordResponseCollectStatus;
};
