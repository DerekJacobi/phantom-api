import express from "express";
import cors from "cors";
import routes from "./api/routes.ts";
import userRoutes from "./api/users/user-routes.ts";
import morgan from "morgan";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("combined"));

app.use("/api/users", userRoutes);
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Phantom backend listening on port ${port}`);
});
