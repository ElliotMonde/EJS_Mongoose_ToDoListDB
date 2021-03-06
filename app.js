//jshint esversion:6
/* @author: Elliot Phua | @ElliotMonde on github
 * Description: A To-Do-List webApp that stores newly created pages and the tasks in them.
 * Task can also be deleted too.
 * Done in Feb 2022.
 */
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
//  for connect account password
const key = require(__dirname + "/key.js").key();
// connect to database (use localhost if not on mongodb atlas)
const db = mongoose.connect("mongodb+srv://ElliotMonde:"+key+"@elliotmonde.thgc3.mongodb.net/ToDoV2");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];
// if Page property of tasks are same as the pageName property of pages, push that task into the taskItems property of array of taskSchema subdocuments
// define the page document in when get page
// define new tasks when post to page address
// save task and push into page document's taskItems array
// redirect back to page address
//  Task Schema, prototype for task models
// if post to /delete, delete the task document and the task subdocument in the page array
// by getting the name of the item submitted by form action in list.ejs
// redirect to page id (get page id by the listTitle in list.ejs) , after the save is complete. save will persist so add the redirect after save

const taskSchema = mongoose.Schema({
  Task: {
    type: String,
    required: 1
  },
  Page: {
    type: String,
    required: 1
  }
});
const TaskModel = mongoose.model("Task", taskSchema);

//  Page list
const pageSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: 1
  },
  //  array of taskSchema-type documents
  taskItems: [taskSchema]
});
const PageModel = mongoose.model("Page", pageSchema);



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
app.get("/" || "/home", function (req, res) {
  res.redirect("/Home");
})

app.get("/Home", function (req, res) {
  const id = "Home";
  console.log("id:" + id);

  PageModel.findOne({ pageName: id }, function (err, pageFound) {
    if (err) { console.log(err) };
    if (pageFound == null) {
      pageFound = new PageModel({
        pageName: id,
        taskItems: []
      })
      console.log("after creating pageFound : " + pageFound);
    } else {
      console.log("get page exists: " + pageFound);
    }

    if (pageFound.taskItems == '') {
      const defTask1 = new TaskModel({
        Task: "click '+' to add new Task",
        Page: id
      });
      const defTask2 = new TaskModel({
        Task: "<--check box to delete Task",
        Page: id
      });
      defTask1.save();
      defTask2.save();
      pageFound.taskItems.push(defTask1);
      pageFound.taskItems.push(defTask2);
      pageFound.save(function(err){
        if(err){console.log(err)};
        return res.render("list", { listTitle: pageFound.pageName, newListItems: pageFound.taskItems });
      });
    }//add default
    return res.render("list", { listTitle: "Home", newListItems: pageFound.taskItems });
  })

})

app.get("/:id", function (req, res) {
  const id = _.capitalize(req.params.id).replace(/-/g, " ");
  console.log("id:" + id);

  PageModel.findOne({ pageName: id }, function (err, pageFound) {
    if (err) { console.log(err) };
    if (pageFound == null) {
      pageFound = new PageModel({
        pageName: id,
        taskItems: []
      })
    }
    if (pageFound.taskItems.length == 0) {
      const defTask1 = new TaskModel({
        Task: "click '+' to add new Task",
        Page: pageFound.pageName
      });
      const defTask2 = new TaskModel({
        Task: "<--check box to delete Task",
        Page: pageFound.pageName
      });
      defTask1.save();
      defTask2.save();
      pageFound.taskItems.push(defTask1);
      pageFound.taskItems.push(defTask2);
      pageFound.save(function(err){
        if(err){console.log(err)};
        //return res.render("list", { listTitle: pageFound.pageName, newListItems: pageFound.taskItems });
      });
      
    }
    return res.render("list", { listTitle: pageFound.pageName, newListItems: pageFound.taskItems });
  })

})
//  post to <specific> must be called ontop of <general i.e. /:id> so that it is ran first
app.post("/delete", function (req, res) {
  const deleteItem = req.body.checkbox;
  const id = req.body.hidden;
  PageModel.findOne({ pageName: id }, function (err, pageFound) {
    if (err) { console.log(err) };
    pageFound.taskItems.pull({ _id: deleteItem });
    //  remember to save document so that the delete action is saved
    pageFound.save(function(err){
      if (err){console.log(err)};
      return res.redirect("/" + _.kebabCase(_.capitalize(id)));
    });
    
  });

  

})

app.post("/" || "home", function (req, res) {
  console.log("req.body.list is : " + req.body.list);
  console.log("req.body.newItem : " + req.body.newItem);
  const id = "Home";
  const newItem = req.body.newItem;
  //  use findOne to return one document else an array of documents
  PageModel.findOne({ pageName: id }, function (err, pageFound) {
    if (err) { console.log(err) };
    const newTask = new TaskModel({
      Task: newItem,
      Page: id
    });
    newTask.save();
    console.log("pageFound.taskItems : " + pageFound.taskItems);
    pageFound.taskItems.push(newTask);
    pageFound.save(function(err){
      if (err){console.log(err)};
      return res.redirect("/" + _.kebabCase(_.capitalize(id)));
  })

})
})

app.post("/:id", function (req, res) {
  console.log("req.body.list is : " + req.body.list);
  console.log("req.body.newItem : " + req.body.newItem);
  const id = req.body.list;
  const newItem = req.body.newItem;
  //  use findOne to return one document else an array of documents
  PageModel.findOne({ pageName: id }, function (err, pageFound) {
    if (err) { console.log(err) };
    const newTask = new TaskModel({
      Task: newItem,
      Page: id
    });
    newTask.save();
    console.log("pageFound.taskItems : " + pageFound.taskItems);
    pageFound.taskItems.push(newTask);
    pageFound.save(function(err){
      if (err){console.log(err)};
      return res.redirect("/" + _.kebabCase(_.capitalize(id)));
  })

})

})




