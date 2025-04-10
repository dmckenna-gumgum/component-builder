export const defaultJavascript = `// Access config values using window.componentConfig.properties
console.log("RUN!")
const config = window.componentConfig.properties;
console.log(config);
console.log(document.querySelector('#square-container'))
const container = document.querySelector('#square-container');
// Example: Update text color based on config
try {
    container.style.color = config.textColor.value;
    container.style.fontSize = config.fontSize.value;
    container.style.width = config.containerWidth.value + "px";
    console.log('success');
} catch(e) {
    console.log(e);
}`;
