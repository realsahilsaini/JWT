const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const JWT_SECRET = "sahilsaini";

const app = express();

app.use(express.json());

const users = [];
const todos = [];

app.use(express.static(path.join(__dirname)));

app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/todo.html');
})

//Register a user
app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  //We need to check if the user already exists
  const exisitngUser = users.find((user)=> user.username === username);

  if(exisitngUser){
    return res.status(409).send('User already exists');
  }else{
    users.push({
      username: username,
      password: password,
    });
  }
  res.status(201).json({message: 'User created successfully'});
});


app.post('/signin', (req,res)=>{
  const username = req.body.username;
  const password = req.body.password;

  const foundUser = users.find((user)=> user.username === username && user.password === password);

  if(!foundUser){
    return res.status(401).send('Invalid username or password');
  }else{
    const token = jwt.sign({username: foundUser.username}, JWT_SECRET);
    res.status(200).json({token: token});
  }

})


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


function authMiddleware(req,res,next){  
  const token = req.headers.token;

  if(!token){
    return res.status(401).send('Token Missing!');
  }

  try{
    const decodedUser = jwt.verify(token, JWT_SECRET);

    req.username = decodedUser.username;

    next();

  }catch(error){
    res.status(400).send('Invalid token');
  }
}


//Get all todos for the current user
app.get('/todos', authMiddleware,(req, res)=>{
  const curentUser = req.username;

  const userTodos = todos.filter((todo)=>todo.username == curentUser);

  res.status(200).json(userTodos);

})


//Create a todo for the current user
app.post('/todos', authMiddleware, (req,res)=>{
  const task = req.body.task;

  //We need to get the current user
  const currentUser = req.username;

  //check if the task is provided
  if(!task){
    return res.status(400).send('Task cannot be required');
  }


  //Create a new todo object
  const newTodo = {
    id: todos.length + 1,
    username: currentUser,
    task: task,
    done: false
  };

  //Add the new todo to the todos array
  todos.push(newTodo);

  //Send the new todo as response
  res.status(201).json({message: 'Todo created successfully'});
})


//Update a todo for the current user
app.put('/todos/:id', authMiddleware, (req, res)=>{
  const id = req.params.id;

  //Get updtated task from the request body
  const task = req.body.task;

  const currentUser = req.username;

  const todo = todos.find((todo)=> todo.id == parseInt(id) && todo.username == currentUser);

  if(!todo){
    return res.status(404).send('Todo not found');
  }

  if(!task){
    return res.status(400).send('Task cannot be empty');
  }

  //Update the task
  todo.task = task;

  res.status(200).json({message: 'Todo updated successfully', todo: todo});

})


//Delete a todo for the current user
app.delete('/todos/:id', authMiddleware, (req, res)=>{
  const id = req.params.id;

  const currentUser = req.username;

  const todoIndex = todos.findIndex((todo)=> todo.id == parseInt(id) && todo.username == currentUser);

  if(todoIndex === -1){
    return res.status(404).send('Todo not found');
  }

  todos.splice(todoIndex, 1);

  res.status(200).json({message: 'Todo deleted successfully'});
})


//Mark a todo as done
app.put('/todos/:id/done', authMiddleware, (req, res)=>{
  const id = req.params.id;
  const currentUser = req.username; 

  const todo = todos.find((todo)=> todo.id == parseInt(id) && todo.username == currentUser);

  if(!todo){
    return res.status(404).send('Todo not found');
  }

  todo.done = !todo.done;


  res.status(200).json({message: `Todo ${todo.done ? "completed" : "incmompleted"}.`, todo: todo});
})


app.listen(3000, ()=>{
  console.log('Server listening http://localhost:3000');
})