function entrepose(){
    const caches_key = ["css", "iife", "html", "image", "json", "svg", "template", "video"];
    
    const caches = {};
    
    for(let key of caches_key){
        caches[key] = {};
    };

    this.get = function get(url, type="iife"){
        if(!caches_key.includes(type)) return console.warn("Type is not supported!");

        return caches[type][url];
    };

    this.put = function put(url, value, type="iife"){        
        if(!caches_key.includes(type)) return console.warn("Type is not supported!");

        return caches[type][url] = value;
    }
};

export default new entrepose();