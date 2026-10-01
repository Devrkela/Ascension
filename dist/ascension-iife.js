(function () {
    'use strict';

    window.ascension = {};

    function entrepose(){
        const caches_key = ["css", "iife", "html", "image", "json", "svg", "template", "video"];
        
        const caches = {};
        
        for(let key of caches_key){
            caches[key] = {};
        }
        this.get = function get(url, type="iife"){
            if(!caches_key.includes(type)) return console.warn("Type is not supported!");

            return caches[type][url];
        };

        this.put = function put(url, value, type="iife"){        
            if(!caches_key.includes(type)) return console.warn("Type is not supported!");

            return caches[type][url] = value;
        };
    }
    var entrepose$1 = new entrepose();

    window.ascension.entrepose = entrepose$1;

    const keys = ["css", "iife", "html", "image", "json", "svg", "template", "video"];

    const temporary = {};

    for(let key of keys){
        temporary[key] = {};
    }
    function clean(url, type, value){
        ascension.entrepose.put(url, value, type);
        delete temporary[type][url];
        return value;
    }
    function distribue(url, type="iife"){
        const isTemporary = temporary[type][url];
        if(isTemporary) return isTemporary;
        
        const isCached = window.ascension.entrepose.get(url, type);
        if(isCached) return Promise.resolve(isCached);

        return temporary[type][url] = window.ascension.alimente(url, type).then(clean.bind(null, url, type));
    }

    window.ascension.distribue = distribue;

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
            component[key].then(install.bind(null, key));
        }
    }
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
    }

    window.ascension.fabrique = fabrique;

    function installe(target, component){
        if(component.css && !component.css.isConnected) document.head.appendChild(component.css);     
        if(component.js) component.js(component.html, component.data);
        if(component.html) target.replaceWith.apply(target, component.html.children);
    }

    window.ascension.installe = installe;

})();
