(function () {
  'use strict';

  window.ascension = {};

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

  window.ascension.alimente = alimente$1;

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
