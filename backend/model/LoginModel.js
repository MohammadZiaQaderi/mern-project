import mongoose from "mongoose";

const LoginSchema=new mongoose.Schema({
    f_Username:{
        type:String, required:true,
    },
    f_Pwd:{
        type:String, required:true,
    },
})

export const LoginModel=mongoose.model("t_login",LoginSchema)