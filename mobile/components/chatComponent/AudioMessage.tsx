import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

type Props = { uri: string; duration?: number | null; mine: boolean };

export default function AudioMessage({ uri, duration, mine }: Props) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  const total = status.duration > 0 ? status.duration : (duration ?? 0);
  const progress = total > 0 ? Math.min(status.currentTime / total, 1) : 0;

  const toggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    // phát lại từ đầu nếu đã hết
    if (total > 0 && status.currentTime >= total - 0.1) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View className="mb-1 w-[200px] flex-row items-center gap-2.5">
      <TouchableOpacity
        onPress={toggle}
        className={`h-9 w-9 items-center justify-center rounded-full ${
          mine ? "bg-white/25" : "bg-[#EEEBFF]"
        }`}
      >
        <Ionicons
          name={status.playing ? "pause" : "play"}
          size={18}
          color={mine ? "#fff" : "#3B2FD0"}
        />
      </TouchableOpacity>

      <View className="flex-1">
        <View
          className={`h-1 rounded-full ${mine ? "bg-white/30" : "bg-slate-200"}`}
        >
          <View
            style={{ width: `${progress * 100}%` }}
            className={`h-1 rounded-full ${mine ? "bg-white" : "bg-[#3B2FD0]"}`}
          />
        </View>
        <Text
          className={`mt-1 text-[11px] ${mine ? "text-[#D6D3FF]" : "text-gray-400"}`}
        >
          {fmt(status.playing ? status.currentTime : total)}
        </Text>
      </View>
    </View>
  );
}
