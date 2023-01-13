const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

app.get("/", (req, res)=>{

    let day = new Date();
    res.render("toDoList", {dayOfWeek: dayName[day.getDay()]});

});







app.listen(3000, ()=>{
    console.log("Listening on port 3000");
});