import express from "express";
import fetch from "node-fetch";

const userRoutes = express.Router();

const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
];

userRoutes.get("/", async (req, res) => {
  try {
    res.send(users);
  } catch (error) {
    res.status(500).send({ error: "Failed to get users" });
  }
});

userRoutes.get("/:userId", (req, res) => {
  try {
    const user = users.find((user) => user.id === parseInt(req.params.userId));
    res.send(JSON.stringify(user));
  } catch (error) {
    res.status(500).send({ error: "Failed to get user" });
  }
});

export default userRoutes;
