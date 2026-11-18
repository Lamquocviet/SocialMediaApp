import { View, Text, Image } from "react-native";

interface UserAvatarProps {
  displayName?: string;
  profilePicture?: string | null;
  size?: number;
}

const AVATAR_BG = "#E0E7FF"; // nền xanh tím nhạt
const AVATAR_TEXT = "#3730A3"; // chữ indigo đậm

const UserAvatar = ({ displayName, profilePicture, size = 48 }: UserAvatarProps) => {
  const initial = displayName?.trim().charAt(0).toUpperCase() || "?";

  if (profilePicture) {
    return (
      <Image
        source={{ uri: profilePicture }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: AVATAR_BG,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: AVATAR_TEXT,
          fontSize: size * 0.45,
          fontWeight: "600",
        }}
      >
        {initial}
      </Text>
    </View>
  );
};

export default UserAvatar;
