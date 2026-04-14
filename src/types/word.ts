/** 단어 추출 결과 아이템 — API 연동 시 orval 생성 스키마로 교체한다 */
export type ExtractWordItem = {
  id: string;
  lemma: string;
  meaningKo: string;
  pos: string;
  pronunciation: string;
};
