import { defineConfig } from "orval";

export default defineConfig({
  pickca: {
    input: {
      target: `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8200"}/api-docs`,
    },
    output: {
      target: "src/api/generated",
      client: "react-query",
      httpClient: "axios",
      mode: "tags-split",
      override: {
        mutator: {
          path: "src/lib/axios.ts",
          name: "fetcher",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
