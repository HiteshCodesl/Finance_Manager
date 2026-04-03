import express from "express";
import { userRouter } from "./routes/userRoute.js";
import { dashboardRouter } from "./routes/dashboardRoute.js";
import { recordRouter } from "./routes/recordRoute.js";
import cors from "cors";

const router = express.Router();

const app = express();

app.use(express.json());
app.use(cors());

router.use('/api/v1/user', userRouter);
router.use('/api/v1/record', recordRouter);
router.use('/api/v1/dashboard', dashboardRouter);

app.use(router);

app.get("/", (req, res) => {
  res.send("Server working");
});

app.listen(3000, () => console.log("Server Is Running On Port 3000"));