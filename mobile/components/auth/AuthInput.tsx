import { useState } from "react";
import { View, Text, TextInput, Pressable, TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  isPassword?: boolean;
};

export default function AuthInput({ label, isPassword, ...props }: Props) {
  const [show, setShow] = useState(false);

  return (
    <View className="mb-3">
      <Text className="mb-2 text-xs text-gray-500">{label}</Text>
      <View className="flex-row items-center rounded-2xl border border-gray-200 bg-[#fafafa] px-4">
        <TextInput
          {...props}
          secureTextEntry={isPassword ? !show : props.secureTextEntry}
          placeholderTextColor="#9ca3af"
          autoCapitalize={props.autoCapitalize ?? "none"}
          className="h-12 flex-1 text-sm text-gray-800"
        />
        {isPassword && (
          <Pressable
            onPress={() => setShow((v) => !v)}
            hitSlop={8}
          >
            <Text className="text-xs font-medium text-gray-500">
              {show ? "Ẩn" : "Hiện"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
