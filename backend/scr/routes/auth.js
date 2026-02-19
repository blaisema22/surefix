import { register, login } from "../controllers/adminController.js";
import express from "express";

const routes = express.Router();
routes.post("/registor", register);
routes.post("/login", login);
export default routes;