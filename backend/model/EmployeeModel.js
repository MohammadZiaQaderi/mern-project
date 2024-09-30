import mongoose from "mongoose";

const EmployeeSchema=new mongoose.Schema({
    name:{
        type:String, required: true,
    },
    email:{
        type:String, required:true, unique:true,
    },

    mobile: {
        type: Number,
        required: true,
        unique: true,
        min: 1000000000, // Minimum value for a 10-digit mobile number
        max: 9999999999, // Maximum value for a 10-digit mobile number
        validate: {
          validator: function(v) {
            if(Number.isInteger)
            {
            return /^[0-9]{10}$/.test(v); // Regular expression to match 10-digit numbers
            }  
            return false;
        },
          message: props => `${props.value} is not a valid mobile number! It must be 10 digits.`,
        },
      },

    designation:{
        type:String, required:true
    },
    gender:{
        type:String, required:true, 
        enum: ['Male', 'Female', 'Other'],
    },
    courses:{
        type:String, required:true,
    },
    image : {
        type:[String], required:true,
    },
    createdAt: {
        type: String, // Store date as a string
        default: () => new Date().toISOString().split('T')[0], // Format to 'YYYY-MM-DD'
    },
})

export const EmployeeModel = mongoose.model("Employee",EmployeeSchema)