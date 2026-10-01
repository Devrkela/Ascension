function toJSON$1(response){
    return response.json();
}

function toText(response){
    return response.text();
}
function getJSON(url){
    return fetch(url).then(toJSON$1);
}

function getText(url){
    return fetch(url).then(toText);
}

function cleanup(script){
    URL.revokeObjectURL(script.src);
    script.remove();
}
function promisify$3(text, url, resolve, reject){
    const blob = new Blob([text], {type:"application/javascript"});
    
    const script = document.createElement("script");
    
    function error(err){
        reject(err);
        cleanup(script);
    }
    function load(){
        resolve(alimente.moduleMap[url]);
        cleanup(script);
    }

    Object.assign(script, {type:"module", src: URL.createObjectURL(blob)});

    script.addEventListener("load", load);
    script.addEventListener("error", error);
    
    document.body.appendChild(script);
}

function loadScript(text, url){
    return new Promise(promisify$3.bind(null, text, url));   
}

function promisify$2(url, resolve, reject){
    const link = document.createElement("link");
    const attributes = {href:url, rel:"stylesheet"};

    function error(err){
        reject(err);
        cleanup(link);
    }
    function load(){
        resolve(link.sheet);
        cleanup(link);
    }

    
    Object.assign(link, attributes);

    link.addEventListener("load", load);
    link.addEventListener("error", error);

    document.head.appendChild(link);
}

function toCSS(url){
    return new Promise(promisify$2.bind(null, url));
}

function formatURL(url){
    let _url;
    try{
        _url = new URL(url);
    } catch(e){
        try{
            _url = new URL(url, window.location);
        }
        catch(e){
            return Promise.reject(e);
        }
    }
    return _url;
}

function toESM(url){
    let _url = formatURL(url);

    if(_url instanceof Promise){
        return _url;
    }

    _url = _url.toString();
    
    return loadScript(`
        import * as m from "${_url}";
        window.alimente.moduleMap["${_url}"]=m;
    `, _url);
}

const parser = new DOMParser();

function createDocument(text){
    return parser.parseFromString(text, "text/html");  
}
function toHTML(url){
    return getText(url).then(createDocument);
}

function finalize(){
    return this;
}

function promisify$1(url, resolve, reject){
    const img = document.createElement("img");

    img.src = url;

    function error(err){
        reject(err);
    }

    function load(){
        resolve(img.decode().then(finalize.bind(img)));
    }

    img.addEventListener("error", error);
    img.addEventListener("load", load);
}

function toImage(url){
    return new Promise(promisify$1.bind(null, url));
}

function toJSON(url){
    return getJSON(url);
}

function renderSVG(text){
    const wrapper = document.createElement("div");

    wrapper.innerHTML = text;

    return wrapper.firstChild;
}

function toSVG(url){
    return getText(url).then(renderSVG);
}

function createTemplate(text){
     const div = document.createElement("div");

    div.innerHTML = `<template>${text}</template>`;

    return div.firstChild.content;
}
function toTemplate(url){
    return getText(url).then(createTemplate);
}

function promisify(url, resolve, reject){
    const video = document.createElement("video");

    video.src = url;

    function error(err){
        reject(err);
    }

    function loadeddata(){
        resolve(video);
    }

    video.addEventListener("error", error);
    video.addEventListener("loadeddata", loadeddata);
}

function toVideo(url){
    return new Promise(promisify.bind(null, url));
}

var types = {
    "css": toCSS,
    "esm": toESM,
    "html": toHTML,
    "image": toImage,
    "json": toJSON,
    "svg": toSVG,
    "template": toTemplate,
    "video": toVideo,
};

function alimente$1(url, type){
  if(!type){
    return types["esm"](url);    
  }

  if(!types[type]) return console.warn("Type is not supported!");

  return types[type](url);
}
alimente$1.moduleMap = {};

export default alimente$1;