const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

var listItems = ["buy food", "cook food", "eat food"];

app.get("/", (req, res)=>{

    let day = new Date();
    res.render("toDoList", {dayOfWeek: dayName[day.getDay()], newItems: listItems});

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