import express from "express"
import { toLogin , create, readOne, search, update, deleteOne} from "../controller/EmployeeController.js";
import multer from "multer";

const router=express.Router();

const upload=multer({dest:"uploads/"});

router.post("/Login",upload.single(null), toLogin)

router.post("/createEmployee", upload.single("image"), create)

router.get("/readOneEmployee/:id",readOne)

router.get("/searchEmployee/:name?",search)

router.put("/updateEmployee/:id", upload.single("image"), update)

router.delete("/deleteEmployee/:id", deleteOne)

export default router;