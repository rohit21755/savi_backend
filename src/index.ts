import express from "express";
import cors from "cors";
import paymentRoutes from "./routes/payment";
import dotenv from "dotenv";
import userRoute from "./routes/user";
import adminRoute from "./routes/admin";
import addressRoutes from "./routes/address";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/address", addressRoutes);


app.listen(4000, () => {
  console.log("Server is running on port 4000");
});