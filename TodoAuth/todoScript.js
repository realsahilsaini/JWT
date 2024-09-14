function toggleForm() {
  const signup = document.getElementById("signup");
  const signin = document.getElementById("signin");
  if (signup.style.display === "none") {
    signup.style.display = "block";
    document.querySelector(".signup-username").value = "";
    document.querySelector(".signup-password").value = "";
    signin.style.display = "none";
  } else {
    signup.style.display = "none";
    signin.style.display = "block";
    document.querySelector(".signin-username").value = "";
    document.querySelector(".signin-password").value = "";
  }
}

async function signup() {
  try {
    event.preventDefault();
    const username = document.querySelector(".signup-username").value;
    const password = document.querySelector(".signup-password").value;

    const response = await axios.post("http://localhost:3000/signup", {
      username: username,
      password: password,
    });

    alert(response.data.message);

    username.value = "";
    password.value = "";


    toggleForm();
  } catch (err) {
    if (err.response.status === 409) {
      alert("Username already exists");
    }
  }
}

async function signin() {
  event.preventDefault();

  const username = document.querySelector(".signin-username").value;
  const password = document.querySelector(".signin-password").value;

  //Gives token
  try {
    const response = await axios.post("http://localhost:3000/signin", {
      username: username,
      password: password,
    });

    if (response.status === 200) {
      localStorage.setItem("token", response.data.token);

      //   document.querySelector(".information").innerText =
      //     "Signed in successfully";

      alert("Signed in successfully");

      username.value = "";
      password.value = "";

      //   getInfo();
      showTodoApp();
    }
  } catch (err) {
    if (err.response.status === 401) {
      alert("Invalid username or password");
    }
  }
}

// async function getInfo() {
//   const token = localStorage.getItem("token");
//   const resposne = await axios.get("http://localhost:3000/user", {
//     headers: {
//       token: token,
//     },
//   });

//   const userName = resposne.data.username;
//   const password = resposne.data.password;

//   document.querySelector(
//     ".information"
//   ).innerText = `Username: ${userName}, Password: ${password}`;
// }

async function logout() {
  localStorage.removeItem("token");
  
  document.querySelector("#todos-container").style.display = "none";
  
  document.querySelector("#signin").style.display = "block";
  document.querySelector(".signin-username").value = "";
  document.querySelector(".signin-password").value = "";
  
  alert("Logged out successfully");
}

async function showTodoApp() {
  document.querySelector("#todos-container").style.display = "block";

  document.querySelector("#signin").style.display = "none";
  document.querySelector("#signup").style.display = "none";

  getTodos();
}

async function getTodos() {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get("http://localhost:3000/todos", {
      headers: {
        token: token,
      },
    });


    const todoList = document.getElementById("todos-list");

    todoList.innerHTML = "";

    const todosList  = document.getElementById("todos-list");

    if (response.data.length) {
      response.data.forEach((todo) => {

        const todoDiv = document.createElement("div");
        todoDiv.classList.add("todo");
        todoDiv.innerHTML = `
        <div class="todo" style="display: flex; align-items: center; gap: 2rem;">
                    <p>${todo.id}</p>
                    <p>${todo.task}</p>
                    <button onclick="updateTodo(${todo.id})" style="height: 30px;">Update</button>
                    <button onclick="deleteTodo(${todo.id})" style="height: 30px;">Delete</button>
          </div>
        `;
        todosList.appendChild(todoDiv);
      });
    }
  } catch (err) {
    console.log(err);
  }
}


async function addTodo(){

  const inputElem = document.querySelector('#input');
  const task = inputElem.value;

    if(task.trim()=== ""){
      alert('Task cannot be empty');
      return;
    }

  try{

    const token = localStorage.getItem('token');

    await axios.post('http://localhost:3000/todos',{task: task,},{headers: {token: token} });


    inputElem.value = '';

    getTodos();

  }catch(err){
    console.error(err);
  }
}


async function deleteTodo(id){
  const taskid = id;


  try{
    const token = localStorage.getItem('token');

    await axios.delete(`http://localhost:3000/todos/${taskid}`,{headers: {token: token} });

    getTodos();
  }catch(err){
    console.error(err);
  }

}


async function updateTodo(id){

  const taskid = id;
  
  const newTask = prompt('Enter new task');

  if(newTask.trim() === ""){
    alert('Task cannot be empty');
    return;
  }

  try{
    const token = localStorage.getItem('token');

    await axios.put(`http://localhost:3000/todos/${taskid}`,{task: newTask},{headers: {token: token} });
  }catch(err){
    console.error(err);
  }

    getTodos();
}