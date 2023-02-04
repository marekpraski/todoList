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
  post("/saveItem", "todoItem", JSON.stringify({todoId: id, txt: value}));
}

function post(path, inputName, inputValue) {

  // The rest of this code assumes you are not using a library.
  // It can be made less verbose if you use one.
  const form = document.createElement('form');
  form.method = "post";
  form.action = path;

  const hiddenField = document.createElement('input');
  hiddenField.type = 'hidden';
  hiddenField.name = inputName;
  hiddenField.value = inputValue;

  form.appendChild(hiddenField);
  document.body.appendChild(form);
  form.submit();
}
