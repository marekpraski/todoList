
const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
  tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}

function autoSave(id, value){
  DynamicForm.post("/saveItem", "todoItem", JSON.stringify({todoId: id, txt: value}));
}

//obsługa przeciągania elementów listy

const sources = document.querySelectorAll(".dragItem");
for(let i = 0; i < sources.length; i++){
  sources[i].addEventListener("dragstart", (ev) => {
  // Change the source element's background color
  // to show that drag has started
  ev.currentTarget.classList.add("dragging");
  // Clear the drag data cache (for all formats/types)
  ev.dataTransfer.clearData();
  // Set the drag's format and data.
  // Use the event target's id for the data
  ev.dataTransfer.setData("text/plain", ev.target.id);
})};

for(let i = 0; i < sources.length; i++){
  sources[i].addEventListener("dragend", (ev) =>
  ev.target.classList.remove("dragging")
)};

const targets = document.querySelectorAll(".dragTarget");
for(let i = 0; i < targets.length; i++){
  targets[i].addEventListener("dragover", (ev) => {
  ev.target.classList.add("draggedOver");
  ev.preventDefault();
})};

for(let i = 0; i < targets.length; i++){
  targets[i].addEventListener("dragleave", (ev)=>{
    ev.target.classList.remove("draggedOver");
    ev.preventDefault();
  })
}

for(let i = 0; i < targets.length; i++){
  targets[i].addEventListener("drop", (ev) => {
  ev.target.classList.remove("draggedOver");
  ev.preventDefault();
  // Get the data, which is the id of the source element
  const data = ev.dataTransfer.getData("text");
  const movedItemId = document.getElementById(data).id;
  const newPos = targets[i].id;
  DynamicForm.post("/moveItem", "movedItem", JSON.stringify({oldPosition: movedItemId, newPosition: newPos}));
})};

