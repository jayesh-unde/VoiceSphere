require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


main().
then(()=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/VoiceSphere');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
const corsOption = {
    credentials:true,
    origin:['http://localhost:3000'],
};
app.use(cors(corsOption));

const PORT = process.env.PORT || 5500;
app.use(bodyParser.json());
app.use(express.json());
app.use(router);


app.get('/',(req,res)=>{
    // console.log("app is listening");
    res.send("app is listening");
})
app.listen(PORT,()=>{
    console.log(`Listening on Port ${PORT}`);
})