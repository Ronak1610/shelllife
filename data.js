const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://100XTRELLO:neets%40ck3(+)@100xtrello.kkim419.mongodb.net/shelflife")

const userSchema = new Schema ({
  
    name: String,
    email: String,
    password : String,
    householdId : {type : Schema.Types.ObjectId, ref:'houseHold'},
},{ timestamps:true});
const itemsSchema = new Schema({
   
    householdId : {type : Schema.Types.ObjectId, ref : 'houseHold'},
    addedBy : { type : Schema.Types.ObjectId, ref : 'users'},
    name : String,
    category : String,
    quantity : Number,
    expiryDate : Date,
    status : String,
    },
    { timestamps:true }
);
const householdSchema = new Schema({
    
    name: String,
    inviteCode : Number,
    members : {type : Schema.Types.Array, ref : 'users'},
    wasteScore: {
     type : Schema.Types.Number,
     default : 0
    }
},
{
    timestamps: true
}
);

const userModels = mongoose.model("users", userSchema);
const itemsModel = mongoose.model("items", itemsSchema);
const houseHoldModel = mongoose.model("households",householdSchema);

module.exports = {
    users : userModels,
    items : itemsModel,
    households : houseHoldModel

}