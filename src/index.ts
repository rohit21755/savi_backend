import express from "express";
import cors from "cors";
import paymentRoutes from "./routes/payment";
import { configDotenv } from "dotenv";
import userRoute from "./routes/user";
configDotenv();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoute);

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});