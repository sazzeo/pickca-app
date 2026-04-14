import { createContext, useContext, useState } from "react";

import type { ExtractWordItem } from "@/types/word";

interface ExtractContextType {
  extractedWords: ExtractWordItem[];
  setExtractedWords: (words: ExtractWordItem[]) => void;
  clearExtractedWords: () => void;
}

const ExtractContext = createContext<ExtractContextType | undefined>(undefined);

export function ExtractProvider({ children }: { children: React.ReactNode }) {
  const [extractedWords, setExtractedWords] = useState<ExtractWordItem[]>([]);

  const clearExtractedWords = () => setExtractedWords([]);

  return (
    <ExtractContext.Provider
      value={{ extractedWords, setExtractedWords, clearExtractedWords }}
    >
      {children}
    </ExtractContext.Provider>
  );
}

export function useExtractContext(): ExtractContextType {
  const context = useContext(ExtractContext);
  if (!context) {
    throw new Error("useExtractContext는 ExtractProvider 안에서 사용해야 합니다.");
  }
  return context;
}
