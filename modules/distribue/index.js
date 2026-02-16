const keys = ["css", "iife", "html", "image", "json", "svg", "template", "video"];

const temporary = {};

for(let key of keys){
    temporary[key] = {};
};

function clean(url, type, value){
    ascension.entrepose.put(url, value, type);
    delete temporary[type][url];
    return value;
};

function distribue(url, type="iife"){
    const isTemporary = temporary[type][url];
    if(isTemporary) return isTemporary;
    
    const isCached = window.ascension.entrepose.get(url, type);
    if(isCached) return Promise.resolve(isCached);

    return temporary[type][url] = window.ascension.alimente(url, type).then(clean.bind(null, url, type));
};

export default distribue;