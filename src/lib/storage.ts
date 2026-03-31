/**
 * 토큰 저장소 — expo-secure-store 사용 (웹의 localStorage 역할)
 *
 * SecureStore는 iOS Keychain / Android Keystore에 암호화 저장하므로
 * 웹의 난독화(obfuscate)가 불필요하다. 더 안전함.
 */
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "__pca_s";
const REFRESH_TOKEN_KEY = "__pca_rs";
const USER_KEY = "__pca_ctx";

export interface StoredUser {
  email: string;
  nickname: string;
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
