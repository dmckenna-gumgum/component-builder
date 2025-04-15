export const defaultJavascript = `// Access config values using window.componentConfig.properties
function updateComponent() {
  try {
    const config = window.componentConfig.properties;
    if (!config) {
      console.warn('No config properties found');
      return;
    }

    const container = document.querySelector('#square-container');
    if (!container) {
      console.warn('Container element not found');
      return;
    }

    // Update container styles
    container.style.color = config.textColor.value;
    container.style.fontSize = config.fontSize.value;
    container.style.fontFamily = config.fontFamily.value;
    
    const widthUnits = config.percentWidth.value === 'true' ? '%' : 'px';
    const heightUnits = config.percentHeight.value === 'true' ? '%' : 'px';
    container.style.width = config.containerWidth.value + widthUnits;
    container.style.height = config.containerHeight.value + heightUnits;
    container.style.backgroundColor = config.backgroundColor.value;
    container.style.borderRadius = config.borderRadius.value + 'px';

    // Update text content
    const textElement = container.querySelector('.text');
    if (textElement) {
      textElement.innerHTML = config.content.value;
    }

    console.log('Component updated successfully');
  } catch (error) {
    console.error('Error updating component:', error);
  }
}

// Wait for DOM content to be loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateComponent);
} else {
  updateComponent();
}`;
