import { addapp, updateapp, getappbyId, getallapp, deleteappbyId } from "../controllers/appointmentController.js";
import express from 'express'

const appRoutes = express();
appRoutes.post("/addapp", addapp);
appRoutes.get("/", getallapp);
appRoutes.get("/:id", getappbyId);
appRoutes.put("/:id", updateapp);
appRoutes.delete("/:id", deleteappbyId);

export default appRoutes;