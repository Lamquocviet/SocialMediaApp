import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./socket/index.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";
import { protectRoute } from "./middleware/auth.middleware.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(arcjetMiddleware);

app.get("/", (req, res) => res.send("Hello from server"));
app.use("/api/auth", authRoutes);

app.use(protectRoute);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);

// error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

const httpServer = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    initSocket(httpServer);
    if (ENV.NODE_ENV !== "production") {
      httpServer.listen(ENV.PORT, () =>
        console.log("Server is up and running on PORT:", ENV.PORT),
      );
    }
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// export for vercel
export default app;
