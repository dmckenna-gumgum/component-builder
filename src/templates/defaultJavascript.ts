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
    container.style.fontFamily = config.fontFamily.value;
    const widthUnits = config.percentWidth.value === 'true' ? '%' : 'px';
    const heightUnits = config.percentHeight.value === 'true'  ? '%' : 'px';
    container.style.width = config.containerWidth.value + widthUnits;
    container.style.height = config.containerHeight.value + heightUnits;
    container.style.backgroundColor = config.backgroundColor.value;
    container.style.borderRadius = config.borderRadius.value + 'px';
    container.querySelector('.text').innerHTML = config.content.value;
    console.log('success');

} catch(e) {
    console.log(e);
}`;
