import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ExtractWordItem } from "@/types/word";

const EXTRACT_DRAFT_KEY = "__pca_extract_draft";

export interface ExtractDraft {
  sourceText: string;
  words: ExtractWordItem[];
  updatedAt: number;
}

function isValidDraft(raw: unknown): raw is ExtractDraft {
  if (!raw || typeof raw !== "object") return false;
  const candidate = raw as Partial<ExtractDraft>;
  return (
    typeof candidate.sourceText === "string" &&
    Array.isArray(candidate.words) &&
    typeof candidate.updatedAt === "number"
  );
}

export async function saveExtractDraft(payload: Omit<ExtractDraft, "updatedAt">): Promise<void> {
  const draft: ExtractDraft = {
    ...payload,
    updatedAt: Date.now(),
  };
  await AsyncStorage.setItem(EXTRACT_DRAFT_KEY, JSON.stringify(draft));
}

export async function getExtractDraft(): Promise<ExtractDraft | null> {
  const raw = await AsyncStorage.getItem(EXTRACT_DRAFT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!isValidDraft(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearExtractDraft(): Promise<void> {
  await AsyncStorage.removeItem(EXTRACT_DRAFT_KEY);
}
