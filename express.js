const express = require("express");
const crypto = require("node:crypto")
const app = express();
const jwt = require("jsonwebtoken");
app.listen(3000);
app.use( express.json());
const {authMiddleware} = require("./authmiddleware")
const {users,items,households} = require("./data")
const bcrypt = require("bcrypt");
const authmiddleware = require("./authmiddleware");

app.post("/signup", async function(req,res) {


  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const hashedPassword = await bcrypt.hash(password,10);
  if(!name || !email || !password)
  {
    res.status(404).json({message : " missing Field"})
    return
  }

  await users.create({
name:name,
email: email,
password:hashedPassword,
});
res.status(201).json({ message : ` user created with ${name} ${email} ${password}`})


});


app.post("/signin", async (req,res)=> {

  const email = req.body.email
  const password = req.body.password
  const finder = await users.findOne({
    email
  })
  
  if(!finder)
  {
    res.status(403).json({message : " NO ONE with THIS Exist"})
    return 
  }
  const passwordFinder = bcrypt.compare(password,finder.password)
  if(!passwordFinder)
  {
    res.status(403).json({ message : " password is Incorrect"})
    return 
  }

  const token = jwt.sign(
    {user_id : finder._id},
    "token123"
  );
  return res.status(200).json({message : token});

})



app.post("/household", authMiddleware, async (req,res) =>
{
  const user_id = req.user_id
  const name = req.body.name
  const inviteCode = await crypto.randomInt(100000,1000000)
  if(!name)
  {
    res.status(403).json({message : " the name for household is empty"})
    return
  }
  const household = await households.create({
    name:name,
    inviteCode:inviteCode
  });
  res.status(201).json({ message : ` houseHold Created with invite Code ${inviteCode}`})
  
  
})

app.post("/household/:inviteCode", authMiddleware,async(req,res)=>
{
  const user_id = req.user_id
  const inviteCode = req.body.inviteCode

})

app.post("/items", authMiddleware, async (req,res) => {
  const user_id = req.user_id
  
})