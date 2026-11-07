import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ActiveUser = {
  id: string;
  name: string;
  avatar?: string;
  isMe?: boolean;
  ring?: boolean;
  online?: boolean;
};

const COLORS = {
  primary: "#5B4BDB",
  primarySoft: "#EEEBFF",
  bg: "#F4F5FA",
  sub: "#6B7280",
};

type Props = {
  user: ActiveUser;
  onPress?: () => void;
};

const ActiveUserItem = ({ user, onPress }: Props) => (
  <TouchableOpacity
    style={styles.activeItem}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={[styles.activeRing, user.ring && styles.activeRingOn]}>
      {user.isMe ? (
        <View style={[styles.activeAvatar, styles.meAvatar]}>
          <Ionicons
            name="person"
            size={24}
            color={COLORS.primary}
          />
        </View>
      ) : (
        <Image
          source={{ uri: user.avatar }}
          style={styles.activeAvatar}
        />
      )}
    </View>

    {user.isMe && (
      <View style={styles.plusBadge}>
        <Ionicons
          name="add"
          size={12}
          color="#fff"
        />
      </View>
    )}

    {user.online && !user.isMe && <View style={styles.onlineDot} />}

    <Text
      style={styles.activeName}
      numberOfLines={1}
    >
      {user.name}
    </Text>
  </TouchableOpacity>
);

export default ActiveUserItem;

const styles = StyleSheet.create({
  activeItem: {
    alignItems: "center",
    width: 56,
  },
  activeRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeRingOn: {
    borderColor: COLORS.primary,
  },
  activeAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  meAvatar: {
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  plusBadge: {
    position: "absolute",
    top: 34,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    position: "absolute",
    top: 36,
    right: 4,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  activeName: {
    fontSize: 11,
    color: COLORS.sub,
    marginTop: 4,
  },
});
