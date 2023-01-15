const express = require("express");
const bodyParser = require("body-parser");
const dateTools = require(__dirname + "/modules/dateTools.js");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

var listItems = ["buy food", "cook food", "eat food"];

app.get("/", (req, res)=>{
    let day = dateTools.date();
    res.render("toDoList", {dayOfWeek: day, newItems: listItems});

});

app.post("/", (req, res)=>{
    let i = req.body.newListItem;
    listItems.push(i);
    console.log(i);
    res.redirect("/");
})





app.listen(3000, ()=>{
    console.log("Listening on port 3000");
});