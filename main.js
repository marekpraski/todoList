const express = require("express");
const bodyParser = require("body-parser");
const dateTools = require(__dirname + "/modules/dateTools.js");     //użycie własnego modułu zawierającego funkcje
const fs = require("fs");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');                      //ustawienia dla modułu ejs, nie kombinować, tak ma być, taka jest składnia
app.use(express.static("public"));              //ustawienia katalogu, w którym są pliki css, obrazki i inne zasoby, które muszą być wykorzystane przez strony ejs

const dataFile = "data/toDoListDB.txt";

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

try{
    getData();
}
catch{
    createNewTodoDB("nieokreślony");
}

var currentPeriodId;
var currentPeriodData;
var currentPeriodHeading;
var currentTodoItems;
var currentDoneItems;

setCurrentItems();

app.get("/", (req, res)=>{
    let day = dateTools.day();
    res.render("toDoList", {dayOfWeek: day, newItems: currentTodoItems, completedItems: currentDoneItems,
    period: currentPeriodHeading});  //używając modułu ejs pliki html zamieniam na ejs
});

app.post("/", (req, res)=>{
    let newItem = new ListItem(req.body.newListItem);
    currentTodoItems.push(newItem);
    todoDB.periodItems[currentPeriodId].todoItems = currentTodoItems;
    saveData(dataFile, todoDB);
    res.redirect("/");
});

app.get("/compose", (req, res)=>{
    res.render("compose", {period: "Nowy plan"});
});

app.post("/compose", (req, res)=>{
    let newPeriodItem = createNewTodoDBItem(req.body.title);
    todoDB.periodItems.push(newPeriodItem);
    todoDB.currentPeriodId = todoDB.periodItems.length - 1;
    setCurrentItems();
    saveData(dataFile, todoDB);
    res.redirect("/");
});

app.get("/all", (req, res)=>{
    res.render("all", {todos: todoDB.periodItems, period: "Wszystkie"});
});

app.get("/:itemId", (req, res)=>{
    let itemId = req.params.itemId;
    res.render("archivedList", {newItems: todoDB.periodItems[itemId].todoItems, 
        completedItems: todoDB.periodItems[itemId].doneItems,
        period: todoDB.periodItems[itemId].periodHeading});
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
    currentDoneItems.push(currentTodoItems[itemId]);
    todoDB.periodItems[currentPeriodId].doneItems = currentDoneItems;
    currentTodoItems.splice(itemId, 1);
    todoDB.periodItems[currentPeriodId].todoItems = currentTodoItems;
    saveData(dataFile, todoDB);
}

function undeleteItem(itemId){
    currentTodoItems.push(currentDoneItems[itemId]);
    todoDB.periodItems[currentPeriodId].todoItems = currentTodoItems;
    currentDoneItems.splice(itemId, 1);
    todoDB.periodItems[currentPeriodId].doneItems = currentDoneItems;
    saveData(dataFile, todoDB);
}

function getData(){
    todoDB = readData(dataFile);
    currentPeriodId = todoDB.currentPeriodId;
    currentPeriodData = todoDB.periodItems[currentPeriodId];

    currentPeriodHeading = currentPeriodData.periodHeading;
    currentTodoItems = currentPeriodData.todoItems;
    currentDoneItems = currentPeriodData.doneItems;
}

function createNewTodoDBItem(title){
    let newPeriodHeading = title;
    let newTodoItems = [];
    let newCompletedItems = [];
    return new PeriodDataItem(newPeriodHeading, newTodoItems, newCompletedItems);
}

function createNewTodoDB(title){
    let newPeriodDataItem = createNewTodoDBItem(title);
    let newPeriodData = [];
    newPeriodData.push(newPeriodDataItem);
    let newCurrentPeriodId = newPeriodData.length - 1;
    todoDB = new TodoDB(newCurrentPeriodId, newPeriodData);
}

function setCurrentItems(){
    currentPeriodId = todoDB.currentPeriodId;
    currentPeriodData = todoDB.periodItems;
    currentPeriodHeading = currentPeriodData[currentPeriodId].periodHeading;
    currentTodoItems = currentPeriodData[currentPeriodId].todoItems;
    currentDoneItems = currentPeriodData[currentPeriodId].doneItems;
}





app.listen(3000, ()=>{
    console.log("Listening on port 3000");
});