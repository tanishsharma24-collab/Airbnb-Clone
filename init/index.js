const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

main()
.then(()=>
{
    console.log("connection succesfully");
})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB = async ()=>
{
  await  Listing.deleteMany({});

  initData.data = initData.data.map((obj)=>({...obj , owner:'69bc676e012952a6b9297c70'}))  ;
   await Listing.insertMany(initData.data);
  
   console.log("db is initialized succesfully");
}

initDB();