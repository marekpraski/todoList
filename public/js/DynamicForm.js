class DynamicForm{
    constructor(){}

    static post(route, inputName, inputValue){
        // The rest of this code assumes you are not using a library.
        // It can be made less verbose if you use one.
        const form = document.createElement('form');
        form.method = "post";
        form.action = route;

        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = inputName;
        hiddenField.value = inputValue;

        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
    }
}