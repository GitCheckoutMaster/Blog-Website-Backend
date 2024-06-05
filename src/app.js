import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import articleRouter from "./routes/article.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/articles", articleRouter);

export default app;
