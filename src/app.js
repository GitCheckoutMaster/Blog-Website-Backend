import express from "express";

const app = express();

app.use(express.json({ limit: "16kb" }));

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

export default app;
