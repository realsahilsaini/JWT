const express = require("express");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "sahilsaini";

const app = express();

app.use(express.json());

const users = [];


//SIGN-UP

app.post("/sign-up", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = {
    username: username,
    password: password,
  };

  users.push(user);

  res.status(201).send("User created successfully");
});


//SIGN-IN

app.post("/sign-in", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const token = jwt.sign({ username: user.username }, JWT_SECRET);
    res.status(200).json({ token });
    console.log(users);
  } else {
    res.status(401).send("Invalid username or password");
  }
});


//ME
app.get("/me", (req, res) => {

    const token = req.headers.authorization;
  const decodedInfo = jwt.verify(token, JWT_SECRET); // {username: 'sahil'}

  if(!decodedInfo){
    res.status(401).send("Invalid token");
  }

  console.log(decodedInfo);


  const username = decodedInfo.username;

  const user = users.find((user) => user.username === username);

  if (user) {
    res.status(200).send({ username: user.username, password: user.password });
  }else{
    res.status(401).send("User not found in Users[]. Maybe server got restarted and Users[] got emptied");
  }


});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
