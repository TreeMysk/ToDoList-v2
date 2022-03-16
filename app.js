//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash"); 

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-linas:kiskis15@cluster0.qtogi.mongodb.net/todolistDB", {useNewUrlPArser: true});

const itemsSchema = {
  name: String
};

const Items = mongoose.model("Items", itemsSchema);

const item1 = new Items({
  name: "Buy Food"
});

const item2 = new Items({
  name: "Cook Food"
});

const item3 = new Items({
  name: "Eat Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) { 



  Items.find({}, function(err, foundItems){
      if(foundItems.length === 0){
         Items.insertMany(defaultItems, function(err){
           if(err){
            console.log(err);
           }else{
            console.log("Working...");
            }
  
          });
          res.redirect("/");
      }else{      
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item4 = new Items({
    name: itemName
  });

  if(listName === "Today"){
    item4.save();
    res.redirect("/");
  } else{ 
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox; 
  const listName = req.body.listName;

  if(listName === "Today"){
    Items.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Working Delete"); 
        res.redirect("/");
      }
    });
  }else{
     List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
     });
  }


});

app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
    }else{
        //Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
});
});
app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
