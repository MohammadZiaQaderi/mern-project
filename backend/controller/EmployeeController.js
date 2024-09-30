import { EmployeeModel } from "../model/EmployeeModel.js";
import { LoginModel } from "../model/LoginModel.js";
import dotenv from "dotenv"
import fs from "fs"
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)




export const toLogin= async (req, res) => {

  try {

    const {f_userName, f_Pwd } = req.body;

    const user = await LoginModel.findOne({ f_Username: f_userName });

    if (!user) {
      console.log("no record fetched invalid credentials");
      return res.status(400).json({ message: "no record fetched invalid credentials p= " });
    }
    const isMatch = await bcrypt.compare(f_Pwd, user.f_Pwd);
    if (!isMatch) {
      console.log("not match credentials");
      return res.status(400).json({ message: "not match password Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, message: "Login successful", username: user.f_Username });
    

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const create = async (req, res) => {
  try {
    const { email } = req.body;

    const existEmp = await EmployeeModel.findOne({ email });
    if (existEmp) {
      const unwantedImagePath = path.join(__dirname, '../'+req.file.path);
      fs.unlink(unwantedImagePath, (err) => {
        if (err) {
          console.error("Error deleting new image path:", err);
          return res.status(500).json({ message: "Error deleting old image" });
        }
      });
      return res.status(400).json({ message: "The employee already exists" });
    }

    // Validate the file presence
    if (!req.file) {
      return res.status(400).json({ message: "File is required." });
    }

    // Create a new employee if it doesn't exist
    let createdAt=new Date(req.body.createdAt);
    createdAt = createdAt.getFullYear()+"-"+(createdAt.getMonth()+1)+"-"+createdAt.getDate();
    const employeeData = { ...req.body, image: req.file.path, createdAt: createdAt };
    const newEmployee = new EmployeeModel(employeeData);
    
    // Save the new employee
    const savedEmployee = await newEmployee.save();
    
    return res.status(200).json(savedEmployee);
    
  } catch (err) {
    console.error(err);
    const unwantedImagePath = path.join(__dirname, '../'+req.file.path);
    fs.unlink(unwantedImagePath, (err) => {
      if (err) {
        console.error("Error deleting new image path:", err);
        return res.status(500).json({ message: "Error deleting old image" });
      }
    });
    if (!res.headersSent) {
      return res.status(500).json({ message: err.message });
    }
  }
};


export const readOne=(req, res)=> {
  const id=req.params.id;
  EmployeeModel.findById(id)
  .then(record=> {
    return record ? res.status(201).json(record) : 
    res.status(400).json({message:"Record not found"})
  })
  .catch(err=> {
    res.status(500).json({message:"server Error "+err})
   })
}

export const search = (req, res) => {
  const name = req.params.name || '';
  
  if (typeof name !== 'string') {
    return res.status(400).json({ message: "Invalid name format" });
  }
  if (name.trim() === '') {
    EmployeeModel.find()
      .then(records => {
        return records.length > 0 
          ? res.status(200).json(records) 
          : res.status(404).json({ message: "No employees found" });
      })
      .catch(err => {
        res.status(500).json({ message: "Server Error: " + err });
      });
  } else {
    EmployeeModel.find({ "name": { $regex: name , $options: 'i' } })
      .then(records => {
        return records.length > 0 
          ? res.status(200).json(records) 
          : res.status(404).json({ message: "Record not found" });
      })
      .catch(err => {
        res.status(500).json({ message: "Server Error: " + err });
      });
  }
};



export const update = (req, res) => {
  const id = req.params.id;

  EmployeeModel.findById(id)
    .then(existingEmployee => {
      if (!existingEmployee) {
        return res.status(404).json({ message: "User not found." });
      }

      const oldImagePath = path.join(__dirname, '../'+ existingEmployee.image);
      
      // Check if an image is provided in the request
      if (req.file) {
        // If there's an old image, delete it
        if (existingEmployee.image) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Error deleting old image:", err);
              return res.status(500).json({ message: "Error deleting old image" });
            }
          });
        }
        
        // Prepare the employee data with the new image
        existingEmployee.image = req.file.path;
      } else if (!existingEmployee.image) {
        return res.status(400).json({ message: "File is required." });
      }

      // Update employee data
      const employeeData = { ...req.body, image: existingEmployee.image };
      return EmployeeModel.findByIdAndUpdate(id, employeeData, { new: true });
    })
    .then(updatedEmployee => {
      if (updatedEmployee) {
        return res.status(200).json(updatedEmployee);
      }
      res.status(404).json({ message: "Update failed." });
    })
    .catch(err => {
      console.error("Server Error:", err);
      res.status(500).json({ message: "Server Error" });
    });
};

export const deleteOne = async (req, res) => {
  const id = req.params.id;
  try {
    const existingEmployee = await EmployeeModel.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ message: "Record not found" });
    }
    
    const oldImagePath = path.join(__dirname, '../'+existingEmployee.image);
     
    fs.unlink(oldImagePath, (err) => {
      if (err) {
        console.error("Error deleting old image:", err);
        return res.status(500).json({ message: "Error deleting old image" });
      }
    });

    const deletedEmployee = await EmployeeModel.findByIdAndDelete(id);
    return res.status(200).json({ message: `The employee ${deletedEmployee.name} was deleted.` });
  } catch (error) {
    console.error(error); // Optional: log the error for debugging
    return res.status(500).json({ message: "Server error" });
  }
};