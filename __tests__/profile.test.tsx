/**
 * profile.tsx 기본 렌더링 테스트
 * - 설정 화면의 섹션 레이블과 항목이 올바르게 렌더링되는지 확인
 */
import { render, screen } from "@testing-library/react-native";
import React from "react";

// AuthContext mock
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { memberId: 1, email: "test@test.com", nickname: "테스트닉네임" },
    updateUser: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// expo-router mock
jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
}));

// expo-constants mock
jest.mock("expo-constants", () => ({
  default: { expoConfig: { version: "1.0.0" } },
}));

// react-native-safe-area-context mock
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// react-native-paper mock
jest.mock("react-native-paper", () => {
  const RN = require("react-native");
  return {
    Text: RN.Text,
    Portal: ({ children }: { children: React.ReactNode }) => children,
    Modal: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
      visible ? children : null,
    TextInput: RN.TextInput,
  };
});

// useUpdateNickname mock
jest.mock("@/api/generated/member/member", () => ({
  useUpdateNickname: () => ({ mutateAsync: jest.fn() }),
}));

import ProfileScreen from "../app/(tabs)/profile";

describe("ProfileScreen", () => {
  it("섹션 레이블이 렌더링된다", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("프로필")).toBeTruthy();
    expect(screen.getByText("앱 정보")).toBeTruthy();
    expect(screen.getByText("계정")).toBeTruthy();
  });

  it("닉네임이 표시된다", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("테스트닉네임")).toBeTruthy();
  });

  it("앱 버전이 표시된다", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("1.0.0")).toBeTruthy();
  });

  it("로그아웃 항목이 표시된다", () => {
    render(<ProfileScreen />);
    expect(screen.getByText("로그아웃")).toBeTruthy();
  });
});
