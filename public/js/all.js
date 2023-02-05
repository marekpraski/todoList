const images = document.getElementsByTagName("img");

for(let i = 0; i < images.length; i++){
    images[i].addEventListener("click", onImgClick);
}

function onImgClick(){
    let imgName = this.name;
    let listId = this.id;
    if(imgName == "deleteImg")
        DynamicForm.post("/deleteList", imgName, listId);
    else if(imgName == "homeImg")
        DynamicForm.post("/toCurrent", imgName, listId);
}