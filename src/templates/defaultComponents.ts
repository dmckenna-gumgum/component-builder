import { ComponentData } from '../components/ComponentGrid';

export const defaultComponents: ComponentData[] = [
  {
    id: 'default-weather',
    name: 'Weather Widget',
    config: JSON.stringify({
      name: 'Weather Widget',
      version: '1.0.0',
      description: 'A customizable weather widget',
      properties: {
        city: {
          value: 'New York',
          input: {
            type: 'text',
            label: 'City Name',
            placeholder: 'Enter city name'
          }
        },
        unit: {
          value: 'celsius',
          input: {
            type: 'radio',
            label: 'Temperature Unit',
            options: ['celsius', 'fahrenheit']
          }
        },
        showHumidity: {
          value: 'true',
          input: {
            type: 'checkbox',
            label: 'Show Humidity'
          }
        },
        backgroundColor: {
          value: '#f0f9ff',
          input: {
            type: 'colorInput',
            label: 'Background Color'
          }
        },
        textColor: {
          value: '#1e3a8a',
          input: {
            type: 'colorInput',
            label: 'Text Color'
          }
        },
        fontSize: {
          value: '16',
          input: {
            type: 'range',
            label: 'Font Size',
            min: 12,
            max: 24,
            step: 1
          }
        },
        updateInterval: {
          value: '30',
          input: {
            type: 'number',
            label: 'Update Interval (seconds)',
            min: 10,
            max: 3600,
            step: 10
          }
        }
      }
    }, null, 2),
    html: `<div id="weather-container">
  <div class="weather-header">
    <h2 class="city-name">Loading...</h2>
    <div class="weather-icon">🌤️</div>
  </div>
  <div class="weather-info">
    <div class="temperature">--°</div>
    <div class="humidity">Humidity: --%</div>
  </div>
</div>`,
    css: `#weather-container {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  margin: 0 auto;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.city-name {
  margin: 0;
  font-weight: 600;
}

.weather-icon {
  font-size: 2em;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.temperature {
  font-size: 2em;
  font-weight: 700;
}

.humidity {
  opacity: 0.8;
}`,
    javascript: `try {
  const config = window.componentConfig.properties;
  const container = document.getElementById('weather-container');
  const cityName = document.querySelector('.city-name');
  const temperature = document.querySelector('.temperature');
  const humidity = document.querySelector('.humidity');

  // Apply configuration
  container.style.backgroundColor = config.backgroundColor.value;
  container.style.color = config.textColor.value;
  container.style.fontSize = config.fontSize.value + 'px';
  cityName.textContent = config.city.value;
  
  // Show/hide humidity based on config
  humidity.style.display = config.showHumidity.value === 'true' ? 'block' : 'none';

  // Simulate weather data
  function updateWeather() {
    const temp = Math.floor(Math.random() * 30) + 10; // Random temp between 10-40
    const humid = Math.floor(Math.random() * 50) + 30; // Random humidity between 30-80
    
    // Convert temperature if needed
    const displayTemp = config.unit.value === 'fahrenheit' 
      ? Math.round(temp * 9/5 + 32)
      : temp;
    
    temperature.textContent = \`\${displayTemp}°\${config.unit.value === 'fahrenheit' ? 'F' : 'C'}\`;
    humidity.textContent = \`Humidity: \${humid}%\`;
  }

  // Initial update
  updateWeather();

  // Set up periodic updates
  const interval = Math.max(10000, Math.min(Number(config.updateInterval.value) * 1000, 3600000));
  setInterval(updateWeather, interval);
} catch (error) {
  console.error('Error in weather widget:', error);
}`,
    lastModified: new Date().toISOString()
  }
];
