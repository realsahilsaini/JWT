const express = require("express");
const { authMiddleware, JWT_SECRET } = require("./auth/auth");
const jwt = require("jsonwebtoken");
const path = require("path");
const { UserModel, TodoModel } = require("./db/db");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {z} = require("zod");
require("dotenv").config();


const app = express();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI);

app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/todo.html");
});

//Register a user
app.post("/signup", async (req, res) => {

  const requiredBody = z.object({
    username: z.string()
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username cannot exceed 20 characters")
      .regex(/^[a-zA-Z0-9]+$/, "Username can only contain alphanumeric characters"),
      
    password: z.string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password cannot exceed 64 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[\W_]/, "Password must contain at least one special character"), 
  });

  const parsedData = requiredBody.safeParse(req.body);
   
  if(!parsedData.success){
    res.json({
      message: "Incorrect format",
    })
  }

  const {username , password} = req.body;


  try {
    // Check if the username already exists
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    await UserModel.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }

    return res
      .status(500)
      .json({ 
        message: "Internal server error"
      });
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const foundUser = await UserModel.findOne({
    username: username,
  });

  if (!foundUser) {
    {
      return res.status(401).json({
        message: "This username does not exist",
      });
    }
  }

  const passwordMatch = await bcrypt.compare(password, foundUser.password);

  if (!passwordMatch) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign({ id: foundUser._id.toString() }, JWT_SECRET);

  res.status(200).json({
    message: "Signin successful",
    token: token,
  });
});

// app.get('/user', (req,res)=>{
//   const token = req.headers.token;

//   if(!token){
//     return res.status(401).send('Access denied');
//   }

//   try{
//     const decodedUser = jwt.verify(token, JWT_SECRET);

//     const userDetails = users.find((user)=> user.username === decodedUser.username);

//     res.status(200).json(userDetails);

//   }catch(err){
//     res.status(400).send('Invalid token');
//   }

// })


// function authMiddleware(req, res, next) {
//   //Get the token from the headers from Todoscript
//   const token = req.headers.token;

//   const decodedData = jwt.verify(token, JWT_SECRET);

//   if (decodedData) {
//     req.userId = decodedData.id;
//     next();
//   } else {
//     res.status(400).send("Invalid token");
//   }
// }

//Get all todos for the current user
app.get("/todos", authMiddleware, async (req, res) => {
  try {
    //Get the user id from the request from authMiddleware
    const userId = req.userId;

    const usertodos = await TodoModel.find({ userId: userId });

    res.status(200).json(usertodos);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

//Create a todo for the current user
app.post("/todos", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const task = req.body.task;

  //check if the task is provided
  if (!task) {
    return res.status(400).send("Task cannot be required");
  }

  await TodoModel.create({
    task: task,
    done: false,
    userId: userId,
  });

  res.status(201).json({ message: "Todo created successfully" });
});

//Update a todo for the current user
app.put("/todos/:id", authMiddleware, async (req, res) => {
  const todoId = req.params.id;

  //Get updtated task from the request body
  const newtask = req.body.task;

  try {
    await TodoModel.findByIdAndUpdate(todoId, { task: newtask }, { new: true });

    res.status(200).json({ message: "Todo updated successfully" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

//Delete a todo for the current user
app.delete("/todos/:id", authMiddleware, async (req, res) => {
  const todoId = req.params.id;
  const userId = req.userId;

  try {
    const deletedTodo = await TodoModel.findOneAndDelete({
      _id: todoId,
      userId: userId,
    });

    if (!deletedTodo) {
      res.status(404).send("Todo not found");
    }

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

//Mark a todo as done
// app.put("/todos/:id", authMiddleware, async (req, res) => {
//   const todoId = req.params.id;
//   const userId = req.userId;

//   try{

//     const UpdatedTodo = await TodoModel.findOneAndUpdate({
//       _id: todoId,
//       userId: userId,
//     },
//       {done: true},
//       {new: true}
//     );

//     if(!UpdatedTodo){
//       return res.status(404).send('Todo not found');
//     }

//     res.status(200).json({message: 'Todo marked as done'});

//   }catch(err){
//     res.status(500).send('Internal server error');
//   }

// });

app.listen(3000, () => {
  console.log("Server listening http://localhost:3000");
});
