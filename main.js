const express = require("express");
const bodyParser = require("body-parser");
const dateTools = require(__dirname + "/modules/dateTools.js");     //użycie własnego modułu zawierającego funkcje
const fs = require("fs");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');                      //ustawienia dla modułu ejs, nie kombinować, tak ma być, taka jest składnia
app.use(express.static("public"));              //ustawienia katalogu, w którym są pliki css, obrazki i inne zasoby, które muszą być wykorzystane przez strony ejs

function readData(dataFile){
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));   //koniecznie Sync, inaczej idzie dalej i zmienna jest undefined !!!
}

function ListItem(value){
    this.value = value;
}


var completedItems = readData("data/completedList.txt");;
var listItems = readData("data/list.txt");

app.get("/", (req, res)=>{
    let day = dateTools.day();
    res.render("toDoList", {dayOfWeek: day, newItems: listItems, completedItems: completedItems});  //używając modułu ejs pliki html zamieniam na ejs
});

app.post("/", (req, res)=>{
    let newItem = new ListItem(req.body.newListItem);
    listItems.push(newItem);
    saveData("data/list.txt", listItems);
    res.redirect("/");
});

app.post("/delete", (req, res)=>{
    removeItem(req.body.chb);
    res.redirect("/");
});

function saveData(dataFile, items){
    fs.writeFile(dataFile, JSON.stringify(items), (err)=>{
        if(err){
            console.log(err);
        }
    });
}

function removeItem(itemId){
    completedItems.push(listItems[itemId]);
    listItems.splice(itemId, 1);
    saveData("data/completedList.txt", completedItems);
    saveData("data/list.txt", listItems);
}





app.listen(3000, ()=>{
    console.log("Listening on port 3000");
});