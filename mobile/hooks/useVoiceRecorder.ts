import { useRef, useState } from "react";
import { Alert } from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import type { MediaFile } from "@/types/chat";

export const useVoiceRecorder = () => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [isRecording, setIsRecording] = useState(false);
  const startedAt = useRef(0);

  const start = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Cần quyền micro", "Hãy cấp quyền micro trong Cài đặt.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAt.current = Date.now();
      setIsRecording(true);
    } catch (e) {
      console.error("Không thể bắt đầu ghi âm", e);
    }
  };

  // Dừng và trả về file để gửi
  const stop = async (): Promise<{ file: MediaFile; duration: number } | null> => {
    if (!isRecording) return null;

    await recorder.stop();
    setIsRecording(false);
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

    const uri = recorder.uri;
    if (!uri) return null;

    const ext = uri.split(".").pop() || "m4a";
    return {
      file: { uri, name: `voice.${ext}`, type: `audio/${ext}` },
      duration: Math.round((Date.now() - startedAt.current) / 1000),
    };
  };

  // Dừng và bỏ
  const cancel = async () => {
    if (!isRecording) return;
    await recorder.stop();
    setIsRecording(false);
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  };

  return {
    isRecording,
    seconds: Math.floor((state.durationMillis ?? 0) / 1000),
    start,
    stop,
    cancel,
  };
};
