const express = require("express");
const bodyParser = require("body-parser");
const dateTools = require(__dirname + "/modules/dateTools.js");     //użycie własnego modułu zawierającego funkcje

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');                      //ustawienia dla modułu ejs, nie kombinować, tak ma być, taka jest składnia
app.use(express.static("public"));              //ustawienia katalogu, w którym są pliki css, obrazki i inne zasoby, które muszą być wykorzystane przez strony ejs

var listItems = ["buy food", "cook food", "eat food"];

app.get("/", (req, res)=>{
    let day = dateTools.date();
    res.render("toDoList", {dayOfWeek: day, newItems: listItems});  //używając modułu ejs pliki html zamieniam na ejs

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