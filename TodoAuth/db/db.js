//Importing the mongoose module
const mongoose = require('mongoose');
// const {Schema} = mongoose;
const Schema = mongoose.Schema;
// const ObjectId = Schema.ObjectId;

const User = new Schema({
  username: String,
  password: String
});

const Todo = new Schema({
  task: String,
  done: Boolean,
  userId: { type: Schema.Types.ObjectId, ref: 'users' }
});

//In the userId field, we are referencing the users collection. This is how we establish a relationship between two collections in MongoDB.


const UserModel = mongoose.model('users', User);
const TodoModel = mongoose.model('todos', Todo);


module.exports = {
  UserModel:UserModel,
  TodoModel:TodoModel
};