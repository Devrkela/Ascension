function installe(target, component){
    if(component.css && !component.css.isConnected) document.head.appendChild(component.css);     
    if(component.js) component.js(component.html, component.data);
    if(component.html) target.replaceWith.apply(target, component.html.children);
};

export default installe;