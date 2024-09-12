const express = require("express");

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
    const token = randomToken();
    user.token = token;
    res.status(200).send({ token });
    console.log(users);
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

function randomToken() {
  let options = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];

  let length = 32;
  let token = "";
  for (let i = 0; i < length; i++) {
    token += options[Math.floor(Math.random() * options.length)];
  }
  return token;
}



/*

1. math.random() generates a random number between 0 and 1

2. math.random() * options.length generates a random number between 0 and options.length

3. math.floor(math.random() * options.length) generates a random number between 0 and options.length, and then rounds it down to the nearest whole number

*/


app.get("/me", (req, res) => {

  const token = req.headers.authorization;
  const user = users.find((user) => user.token === token);

  if (user) {
    res.status(200).send(users);
  } else {
    res.status(401).send("Unauthorized");
  }

});