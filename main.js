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
    createNewTodoDB("autocreated");
}

var currentPeriodId;
var currentPeriodData;
var currentPeriodHeading;
var currentTodoItems;
var currentDoneItems;

setCurrentItems();

app.get("/", (req, res)=>{
    if(currentPeriodHeading === "autocreated"){
        todoDB.periodItems.pop();
        res.redirect("/compose");
    }
    else{
        let day = dateTools.day();
        res.render("toDoList", {newItems: currentTodoItems, completedItems: currentDoneItems,
        period: currentPeriodHeading});  //używając modułu ejs pliki html zamieniam na ejs
    }
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
    let imp = req.body.chbImport;
    if(imp == 1){          //zwraca 1 tylko wtedy jeżeli checkbox jest zaznaczony, jeżeli nie jest zaznaczony zwraca undefined
        for(let i = 0; i < currentTodoItems.length; i++){
            newPeriodItem.todoItems.push(currentTodoItems[i]);
        }
        currentTodoItems.length = 0;
    }
    todoDB.periodItems.push(newPeriodItem);
    todoDB.currentPeriodId = todoDB.periodItems.length - 1;
    setCurrentItems();
    saveData(dataFile, todoDB);
    res.redirect("/");
});

app.get("/all", (req, res)=>{
    res.render("all", {listItems: todoDB.periodItems, 
        period: "Wszystkie", 
        currentId: currentPeriodId});
});

app.post("/toCurrent", (req, res)=>{
    todoDB.currentPeriodId = req.body.homeImg;
    setCurrentItems();
    saveData(dataFile, todoDB);
    res.redirect("/");
});

app.post("/deleteList", (req, res)=>{
    let listIdToDelete = req.body.deleteImg;
    if(todoDB.periodItems.length > 1)
    {
        todoDB.periodItems.splice(listIdToDelete, 1);
        todoDB.currentPeriodId = 0;
        setCurrentItems();
        saveData(dataFile, todoDB);
        if(todoDB.periodItems.length > 1)
            res.redirect("/all");
        else
            res.redirect("/");
    }
});

app.get("/items/:itemId", (req, res)=>{
    let itemId = req.params.itemId;
    let idToSend = itemId;
    if(itemId === currentPeriodId)
        idToSend = -1;      //dla bieżącej listy nie chcę ikonek eksportu
    res.render("archivedList", {listId: idToSend,
        newItems: todoDB.periodItems[itemId].todoItems, 
        completedItems: todoDB.periodItems[itemId].doneItems,
        period: todoDB.periodItems[itemId].periodHeading});
  });

  app.post("/itemExport", (req, res)=>{
    let dataSent = JSON.parse(req.body.export);
    let listId =  dataSent.listId;
    let itemId = dataSent.todoItemId;
    let item = todoDB.periodItems[listId].todoItems.splice(itemId, 1);
    currentTodoItems.push(item[0]);
    saveData(dataFile, todoDB);
    res.redirect("/items/" + listId);
  })

app.post("/toDone", (req, res)=>{
    markItemDone(req.body.chbNew);
    res.redirect("/");
});

app.post("/toPlanned", (req, res)=>{
    markItemPlanned(req.body.chbCompleted);
    res.redirect("/");
});

app.post("/saveItem", (req, res)=>{
    let editedTodoItem = JSON.parse(req.body.todoItem);
    let index = editedTodoItem.todoId;
    let newValue = editedTodoItem.txt;
    currentTodoItems[index].value = newValue;
    saveData(dataFile, todoDB);
    res.redirect("/");
})

app.post("/moveItem", (req, res)=>{
    let movedItem = JSON.parse(req.body.movedItem);
    let oldPosition = movedItem.oldPosition;
    let newPosition = movedItem.newPosition;
    if(oldPosition > newPosition){
        newPosition++;
    }
    if(oldPosition !== newPosition){
        moveItem(oldPosition, newPosition);
        saveData(dataFile, todoDB);
    }
    res.redirect("/");
});

function moveItem(oldPosition, newPosition){
    let movedItem = currentTodoItems.splice(oldPosition, 1)[0];
    console.log(JSON.stringify(movedItem));
    currentTodoItems.splice(newPosition, 0, movedItem);
}

function saveData(dataFile, items){
    fs.writeFile(dataFile, JSON.stringify(items), (err)=>{
        if(err){
            console.log(err);
        }
    });
}

function markItemDone(itemId){
    currentDoneItems.push(currentTodoItems[itemId]);
    todoDB.periodItems[currentPeriodId].doneItems = currentDoneItems;
    currentTodoItems.splice(itemId, 1);
    todoDB.periodItems[currentPeriodId].todoItems = currentTodoItems;
    saveData(dataFile, todoDB);
}

function markItemPlanned(itemId){
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