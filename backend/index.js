import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose";
import bodyParser from "body-parser"
import router from "./router/router.js"
import cors from "cors"

dotenv.config()

const app=express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());

app.use(cors());

app.use(router)

app.use("/uploads",express.static("uploads"))


const {MONGO_URI, DB, PORT}=process.env;

mongoose.connect(MONGO_URI+"/"+DB)
 .then(()=>{
    console.log("Now you are connected to database "+DB);
    app.listen(PORT, ()=> {
        console.log("The server runs on port number " + PORT || 7001);
    })    
 })
 .catch(error=> {
    console.log("no database conecction."+error);
 })