//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const port = process.env.PORT || 10000;
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chukwuebuka:test-123@cluster0.2o4u7ce.mongodb.net/todolistDB");

const  itemSchema = {
  name: String
};

const Item = mongoose.model("item", itemSchema);

  const Item1 = new Item ({
    name: "Welcome to your todolist! start your day properly"
  });
  const Item2 = new Item ({
    name: "Hit the + button to add anew document"
  });
  const Item3 = new Item ({
    name: "< -- Hit this to delete an item"
  });

  const defaultItems = [Item1, Item2, Item3];

  const listSchema = {
    name:String,
    items: [itemSchema]
  }

  const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

Item.find()
.then(function(foundItems){
    if(foundItems.length === 0) {
              Item.insertMany(defaultItems)
              .then(function(items){
                console.log("succesfully saved default items to DB");
              })
              .catch(function(err){
                console.log(err);
              });
              res.redirect("/");
      } else {
             res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

  })
.catch(function(err) {
    console.log(err);
  });
//const day = date.getDate();



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);
  const item = new Item ({
    name: itemName
  });


   if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else{
    console.log("other");
    List.findOne({name:listName})
    .then((foundList, err)=> {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
      if(err){
        console.log(err);
      }
    });
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

   if(listName==="Today") {
     Item.findByIdAndDelete(checkedItem)
     .then(function(){
       console.log("succesfully deleted");
       res.redirect("/");
     })
     .catch(function(err){
       console.log(err);
     });
   } else {
     List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItem}}})
         .then(function(){
           res.redirect("/" + listName);
         })
         .catch(function(err){
           console.log(err);
         });
      };

});

app.get("/:customListName", function(req, res){
   const customListName =_.capitalize(req.params.customListName);

   List.findOne({ name: customListName })
  .then((foundList, err) => {
    if(foundList){
      res.render("list", {listTitle:foundList.name, newListItems:foundList.items})
    } else {
      const list = new List ({
               name: customListName,
               items:defaultItems
             });
             if(list.name==='Favicon.ico'){
               console.log(list.name);
             }else {
               console.log("saved");
               list.save();
               res.redirect("/" + customListName);
             };
      console.log("dosent exist");
    }
  })
  .catch((err)=> {
   console.log(err);
});

   // List.findOne({name:customListName})         this didnt work
   //  .then(function(err, foundList){
   //    if(!err){
   //      if(!foundList){
   //        const list = new List ({
   //          name: customListName,
   //          items:defaultItems
   //        });
   //        if(list.name==='favicon.ico'){
   //          console.log(list.name);
   //        }else {
   //          console.log("saved");
   //          list.save();
   //        };
   //      } else {
   //        console.log("Exists");
   //      }
   //    }
   //  })
   //  .catch(function(err, foundList){
   //    if(foundList){
   //      console.log("exists");
   //    }
   //  });

});



// app.get("/category/:topic", function(req, res){ .... this line of code from is same as app.get("/:topic", function....)
//    console.log(req.params.topic);
// })
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});
