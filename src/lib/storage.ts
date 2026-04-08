/**
 * 토큰 저장소
 *
 * 네이티브: expo-secure-store (iOS Keychain / Android Keystore)
 * 웹(개발용): AsyncStorage 폴백
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "__pca_s";
const REFRESH_TOKEN_KEY = "__pca_rs";
const USER_KEY = "__pca_ctx";

async function getItem(key: string): Promise<string | null> {
  try {
    if (typeof SecureStore.getItemAsync === "function") {
      return await SecureStore.getItemAsync(key);
    }
  } catch {
    // 웹 환경에서 SecureStore 미지원 시 AsyncStorage로 폴백한다.
  }

  return AsyncStorage.getItem(key);
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (typeof SecureStore.setItemAsync === "function") {
      await SecureStore.setItemAsync(key, value);
      return;
    }
  } catch {
    // 웹 환경에서 SecureStore 미지원 시 AsyncStorage로 폴백한다.
  }

  await AsyncStorage.setItem(key, value);
}

async function deleteItem(key: string): Promise<void> {
  try {
    if (typeof SecureStore.deleteItemAsync === "function") {
      await SecureStore.deleteItemAsync(key);
      return;
    }
  } catch {
    // 웹 환경에서 SecureStore 미지원 시 AsyncStorage로 폴백한다.
  }

  await AsyncStorage.removeItem(key);
}

export interface StoredUser {
  email: string;
  nickname: string;
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await setItem(ACCESS_TOKEN_KEY, accessToken);
  await setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await deleteItem(ACCESS_TOKEN_KEY);
  await deleteItem(REFRESH_TOKEN_KEY);
  await deleteItem(USER_KEY);
}

export async function setStoredUser(user: StoredUser): Promise<void> {
  await setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
