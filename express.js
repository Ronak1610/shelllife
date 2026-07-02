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

app.post("/household/join", authMiddleware,async(req,res)=>
{
  const user_id = req.user_id
  const inviteCode = req.body.inviteCode
   if(!inviteCode)
   {
    res.status(403).json({ message : "missing fields"});
    return
   }
  const houseFinder =   await households.findOneAndUpdate(
      {
        inviteCode : inviteCode                                                  
      },
    {  
      $addToSet:{
        members : user_id
      }},
      {
        returnDocument: true
      },
  );
 const houseId = houseFinder._id 
 const userdId = await users.findOneAndUpdate(
  {
    _id: user_id
  },
  {
    householdId : houseId
  },
  {
    returnDocument : true
  },
 )

  if(!houseFinder)
  {
    res.status(400).json({message : " something wrong with  code"});
    return
  }
  res.status(200).json({ message : ` user with ${user_id} has been added`});
  if(!userdId){
  res.status(404).json({message : " no user with this id was found"})
  return
 }
 res.status(200).json({message : `${user_id} has been updated with ${houseId}`})
 console.log(houseId)
})


app.post("/items", authMiddleware, async (req,res) => {
  const user_id = req.user_id
  const name = req.body.name
  const category = req.body.category
  const quantity = req.body.quantity
  const expiryDate = req.body.expiryDate
  const status = req.body.status
  
  if(!name || !category || !quantity || !expiryDate || !status)
  {
    res.status(403).json({message : " missing Fild"});
    return
  }
  const userFind = await users.findOne({
    _id : user_id
  });
  const houseHoldId = userFind.householdId
  console.log(houseHoldId);

  const householdnamefind = await households.findOne({
    _id : houseHoldId
  });

  const householdname = householdnamefind.name
  console.log(householdname);
  const itemsCreate = await items.create({
    name:name,
    householdId:houseHoldId,
    householdName:householdname,
    addedBy:user_id,
    category:category,
    quantity : quantity,
    expiryDate:expiryDate,
    status:status
  });
  res.status(201).json({message : " items have been created "})
});

app.get("/items",authMiddleware, async(req,res) => {
  const user_id = req.user_id
  const status = req.query.status
  const category = req.query.category

  const usersFInder = await users.findById(user_id).populate("householdId")
  if(!usersFInder)
  {
    res.status(404).json({ message : " no user found"});
    return
  }
  const itemfinder = await items.find({
    householdId:usersFInder.householdId,
    status:status,
    category:category
  })
  if(itemfinder.length ===0)
  {
    res.status(404).json({ message : " no result found"})
  return
}
  res.status(200).json({items: itemfinder});
  })
  


app.get("/household/me", authMiddleware, async (req,res)=> {
  const user_id = req.user_id
  const user = await users.findOne({
    _id: user_id
  }).populate("householdId");
 
  if(!user.householdId)
  {
    return res.status(404).json({message : " user isnot part of household"})
  }
 
  res.json({ 
    household : user.householdId
  })
  

})
app.get("/household/:id/members", authMiddleware, async (req,res) => {
  const user_id = req.user_id
  const name = req.params.name
  const housemembers = await households.findOne(
    { 
      name:name
    }
  ).populate("members");
  if(!housemembers)
  {
    res.status(404).json({ message : " not found"});
    return
  }
  res.status(200).json({
    members: housemembers.members
  })
  
})

app.delete("/items/:id",authMiddleware, async(req,res) => {
  const user_id  = req.user_id
  const id = req.params.id
  const userfinder = await users.findOne({
    _id:user_id
  })
  if (!userfinder) {
  return res.status(404).json({
    message: "User not found"
  })
}
  const itemsfinder = await items.findOneAndDelete({
   _id:id,
    householdId: userfinder.householdId
  })
  if(!itemsfinder)
  {
      res.status(404).json({ message : " no items find"})
      return
  }
  res.status(200).json({message : ` ${id} has been removed with items`});
  

})


app.patch("/items/:id/status" , authMiddleware, async (req,res) => {
  const user_id  = req.user_id
  const id = req.params.id
  const status = req.body.status
  const userfinder = await users.findOne({
    _id:user_id
  })
  if (!userfinder) {
  return res.status(404).json({
    message: "User not found"
  })
}
  const itemreplace = await items.findOneAndUpdate(
    
  {
    _id: id,
    householdId:userfinder.householdId
  },
  {
   $set : {
      status:status
    }
  },
  {
    returnDocument : true
  },

)
  if(!itemreplace)
  {
    res.status(404).json({message : " no items found"});
    return
  }
  res.status(200).json({message : ` ${status} has been repacled`});

})
