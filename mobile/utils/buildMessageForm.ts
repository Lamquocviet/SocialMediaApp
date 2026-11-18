import { SendDirectMessagePayload, SendGroupMessagePayload } from "@/types/chat";

export const buildMessageForm = (
  payload: SendDirectMessagePayload | SendGroupMessagePayload,
) => {
  const { image, audio, audioDuration, ...fields } = payload as any;
  const form = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      form.append(key, String(value));
    }
  });

  if (image) form.append("image", image as any); // tên field phải khớp server
  if (audio) {
    form.append("audio", audio as any);
    if (audioDuration) form.append("audioDuration", String(audioDuration));
  }

  return form;
};

export const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
  timeout: 60000, // upload có thể chậm
};
