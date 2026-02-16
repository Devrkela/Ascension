function wait(component, resolve, reject){
    const _component = {};
    const keys = Object.keys(component);
    let processing = keys.length;

    function install(key, value){
        _component[key] = value;
        processing -= 1;
        
        if(!processing) resolve(_component);
    }
    for(let key of keys){
        component[key].then(install.bind(null, key))
    }
};

function fabrique(url, options){
    const component = {};
    
    if(url[url.length - 1] !== "/") url += "/";

    if(options){
        if(options.html) component["html"] = window.ascension.distribue(url + "model.html", "template");
        if(options.css) component["css"] = window.ascension.distribue(url + "view.css", "css");
        if(options.js) component["js"] = window.ascension.distribue(url + "controller.js");
    } else {
        component["html"] = window.ascension.distribue(url + "model.html", "template");
        component["css"] = window.ascension.distribue(url + "view.css", "css");
        component["js"] = window.ascension.distribue(url + "controller.js");
    }
    
    return new Promise(wait.bind(null, component));
};

export default fabrique;