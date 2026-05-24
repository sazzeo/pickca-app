import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Text } from "react-native-paper";

import { useUpdateNickname } from "@/api/generated/member/member";
import { AlertDialog } from "@/components/common/AlertDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/colors";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function ProfileScreen() {
  const { user, updateUser, signOut } = useAuth();

  const [alertState, setAlertState] = useState<{ title: string; description?: string } | null>(
    null
  );
  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);
  const [isNicknameDialogVisible, setIsNicknameDialogVisible] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: updateNickname } = useUpdateNickname();

  const handleNicknamePress = () => {
    setNicknameInput(user?.nickname ?? "");
    setIsNicknameDialogVisible(true);
  };

  const handleNicknameConfirm = async () => {
    if (!user || !nicknameInput.trim()) return;
    setIsSubmitting(true);
    try {
      await updateNickname({
        data: { nickname: nicknameInput.trim() },
      });
      await updateUser({ ...user, nickname: nicknameInput.trim() });
      setIsNicknameDialogVisible(false);
    } catch {
      setAlertState({ title: "오류", description: "닉네임 변경에 실패했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotReady = () => {
    setAlertState({ title: "안내", description: "서비스 준비 중입니다." });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <ScreenHeader title="설정" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 프로필 */}
        <Text style={styles.sectionLabel}>프로필</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleNicknamePress}
            accessibilityRole="button"
            accessibilityLabel="닉네임 변경"
          >
            <View>
              <Text style={styles.rowLabel}>닉네임</Text>
              <Text style={styles.rowSubValue}>{user?.nickname}</Text>
            </View>
            <MaterialCommunityIcons
              name={"chevron-right" as never}
              size={20}
              color={Colors.text.tertiary}
            />
          </Pressable>
        </View>

        {/* 앱 정보 */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>앱 정보</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>버전</Text>
            <Text style={styles.rowStaticValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleNotReady}
            accessibilityRole="button"
            accessibilityLabel="서비스 이용약관"
          >
            <Text style={styles.rowLabel}>서비스 이용약관</Text>
            <MaterialCommunityIcons
              name={"chevron-right" as never}
              size={20}
              color={Colors.text.tertiary}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleNotReady}
            accessibilityRole="button"
            accessibilityLabel="개인정보 처리방침"
          >
            <Text style={styles.rowLabel}>개인정보 처리방침</Text>
            <MaterialCommunityIcons
              name={"chevron-right" as never}
              size={20}
              color={Colors.text.tertiary}
            />
          </Pressable>
        </View>

        {/* 계정 */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>계정</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleNotReady}
            accessibilityRole="button"
            accessibilityLabel="탈퇴하기"
          >
            <Text style={styles.rowLabel}>탈퇴하기</Text>
            <MaterialCommunityIcons
              name={"chevron-right" as never}
              size={20}
              color={Colors.text.tertiary}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setIsLogoutDialogVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="로그아웃"
          >
            <Text style={styles.rowLabel}>로그아웃</Text>
            <MaterialCommunityIcons
              name={"chevron-right" as never}
              size={20}
              color={Colors.text.tertiary}
            />
          </Pressable>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={isNicknameDialogVisible}
        title="닉네임 변경"
        confirmLabel="수정하기"
        confirmDisabled={!nicknameInput.trim() || isSubmitting}
        input={{
          value: nicknameInput,
          onChangeText: setNicknameInput,
          placeholder: "새 닉네임",
          maxLength: 20,
          autoFocus: true,
        }}
        onCancel={() => setIsNicknameDialogVisible(false)}
        onConfirm={handleNicknameConfirm}
      />

      <ConfirmDialog
        visible={isLogoutDialogVisible}
        title="정말 로그아웃하시겠습니까?"
        confirmLabel="로그아웃"
        tone="danger"
        onCancel={() => setIsLogoutDialogVisible(false)}
        onConfirm={() => {
          setIsLogoutDialogVisible(false);
          signOut();
        }}
      />

      <AlertDialog
        visible={alertState !== null}
        title={alertState?.title ?? ""}
        description={alertState?.description}
        onAction={() => setAlertState(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginBottom: 8,
  },
  sectionLabelSpaced: {
    marginTop: 24,
  },
  card: {
    backgroundColor: Colors.bg.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  rowPressed: {
    backgroundColor: Colors.bg.white,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  rowSubValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.primary,
    marginTop: 2,
  },
  rowStaticValue: {
    fontSize: 15,
    color: Colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 16,
  },
});
