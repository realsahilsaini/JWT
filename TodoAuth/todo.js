const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const { UserModel, TodoModel } = require("./db/db");
const mongoose = require("mongoose");
require('dotenv').config();

const JWT_SECRET = "sahilsaini";
const app = express();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/todo.html");
});

//Register a user
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  await UserModel.create({
    username: username,
    password: password,
  });

  res.status(201).json({ message: "User created successfully" });
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({
    username: username,
    password: password,
  });

  if (user) {
    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);

    res.status(200).json({
      message: "Signin successful",
      token: token,
    });
  } else {
    res.status(401).json({
      message: "Invalid username or password",
    });
  }
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

function authMiddleware(req, res, next) {
  //Get the token from the headers from Todoscript
  const token = req.headers.token;

  const decodedData = jwt.verify(token, JWT_SECRET);

  if (decodedData) {
    req.userId = decodedData.id;
    next();
  } else {
    res.status(400).send("Invalid token");
  }
}

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

  try{
    await TodoModel.findByIdAndUpdate(
      todoId,
      {task: newtask},
      {new: true},
    );

    res.status(200).json({message: 'Todo updated successfully'});
  }catch(err){
    res.status(500).send('Internal server error');
  }

});

//Delete a todo for the current user
app.delete("/todos/:id", authMiddleware, async (req, res) => {
  const todoId = req.params.id;
  const userId = req.userId;

  try{

    const deletedTodo = await TodoModel.findOneAndDelete({
      _id: todoId,
      userId: userId
    });

    if(!deletedTodo){
      res.status(404).send('Todo not found');
    }

    res.status(200).json({message: 'Todo deleted successfully'});
  }catch(err){
    res.status(500).send('Internal server error');
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
