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
function PeriodDataItem(periodHeading, todoItems, doneItems){
    this.periodHeading = periodHeading;
    this.todoItems = todoItems;
    this.doneItems = doneItems;
}

function TodoDB(currentPeriodId, periodItems){
    this.currentPeriodId = currentPeriodId;
    this.periodItems = periodItems;
}

var todoDB;
var currentPeriodId;
var currentPeriodData;
var periodHeading;
var todoItems;
var completedItems;
getData();

app.get("/", (req, res)=>{
    let day = dateTools.day();
    res.render("toDoList", {dayOfWeek: day, newItems: todoItems, completedItems: completedItems,
    period: periodHeading});  //używając modułu ejs pliki html zamieniam na ejs
});

app.post("/", (req, res)=>{
    let newItem = new ListItem(req.body.newListItem);
    todoItems.push(newItem);
    todoDB.periodItems[currentPeriodId].todoItems = todoItems;
    saveData("data/toDoListDB.txt", todoDB);
    res.redirect("/");
});

app.post("/delete", (req, res)=>{
    deleteItem(req.body.chbNew);
    res.redirect("/");
});

app.post("/undelete", (req, res)=>{
    undeleteItem(req.body.chbCompleted);
    res.redirect("/");
});

function saveData(dataFile, items){
    fs.writeFile(dataFile, JSON.stringify(items), (err)=>{
        if(err){
            console.log(err);
        }
    });
}

function deleteItem(itemId){
    completedItems.push(todoItems[itemId]);
    todoDB.periodItems[currentPeriodId].doneItems = completedItems;
    todoItems.splice(itemId, 1);
    todoDB.periodItems[currentPeriodId].todoItems = todoItems;
    saveData("data/toDoListDB.txt", todoDB);
}

function undeleteItem(itemId){
    todoItems.push(completedItems[itemId]);
    todoDB.periodItems[currentPeriodId].todoItems = todoItems;
    completedItems.splice(itemId, 1);
    todoDB.periodItems[currentPeriodId].doneItems = completedItems;
    saveData("data/toDoListDB.txt", todoDB);
}

function getData(){
    todoDB = readData("data/toDoListDB.txt");
    currentPeriodId = todoDB.currentPeriodId;
    currentPeriodData = todoDB.periodItems[currentPeriodId];

    periodHeading = currentPeriodData.periodHeading;
    todoItems = currentPeriodData.todoItems;
    completedItems = currentPeriodData.doneItems;
}

function createNewTodoDB(){
    let periodData = [];
    let periodHeading = "this week";
    let todoItems = [];
    let completedItems = [];
    let periodDataItem = new PeriodDataItem(periodHeading, todoItems, completedItems);
    periodData.push(periodDataItem);
    let currentPeriodId = 0;
    let todoDB = new TodoDB(currentPeriodId, periodData);
}





app.listen(3000, ()=>{
    console.log("Listening on port 3000");
});