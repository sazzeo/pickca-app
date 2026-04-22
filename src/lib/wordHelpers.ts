import type {
  WordMeaningResponsePartOfSpeech,
  WordResponse,
} from "@/api/generated/pickcaAPI.schemas";

export const POS_LABEL_MAP: Record<WordMeaningResponsePartOfSpeech, string> = {
  NOUN: "n",
  VERB: "v",
  ADJECTIVE: "adj",
  ADVERB: "adv",
  PREPOSITION: "prep",
  CONJUNCTION: "conj",
  INTERJECTION: "intj",
  PRONOUN: "pron",
};

export function resolvePrimaryMeaning(word: WordResponse): string {
  if (word.primaryMeanings && word.primaryMeanings.trim()) {
    return word.primaryMeanings;
  }
  const firstMeaning = word.meanings[0];
  if (!firstMeaning) return "-";
  return firstMeaning.koreanPrimary || firstMeaning.koreanMeanings || "-";
}

export function resolvePartOfSpeech(word: WordResponse): string {
  const firstMeaning = word.meanings[0];
  if (!firstMeaning) return "word";
  return POS_LABEL_MAP[firstMeaning.partOfSpeech] ?? "word";
}
