function install(model, data){
    const name = document.createElement("p");
    const surname = name.cloneNode(true);

    name.setAttribute("class", "name");
    name.innerHTML = data.name;
    surname.innerHTML = data.surname;

    model.querySelector("slot[name=name]").replaceWith(name);
    model.querySelector("slot[name=surname]").replaceWith(surname);
}