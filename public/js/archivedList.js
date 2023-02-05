var imgs = document.getElementsByTagName("img");
var listId = document.getElementById("listIdHolder").value;

for(let i = 0; i < imgs.length; i++){
    imgs[i].addEventListener("click", onImgClick);
}

function onImgClick(){
    DynamicForm.post("/itemExport", "export", JSON.stringify({listId: listId, todoItemId: this.id}));
}