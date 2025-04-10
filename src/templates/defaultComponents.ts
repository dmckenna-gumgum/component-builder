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
  },
  {
    id: 'default-countdown-timer',
    name: 'Default Countdown Timer',
    config: JSON.stringify({
      "name": "Default Countdown Timer",
      "version": "1.0.0",
      "description": "A customizable countdown timer using simplyCountdown.js",
      "properties": {
        "theme": {
          "value": "dark",
          "input": {
            "type": "select",
            "label": "Clock Theme",
            "group": "clock-settings",
            "options": [
              "default",
              "dark",
              "cyber",
              "losange",
              "circle"
            ]
          }
        },
        "targetDate": {
          "value": "2025-05-01T15:59:59",
          "input": {
            "type": "datetime-local",
            "label": "Target Date",
            "group": "time-settings"
          }
        },
        "wordString": {
          "value": "true",
          "input": {
            "type": "checkbox",
            "label": "Use Word Labels",
            "group": "display-options"
          }
        },
        "words": {
          "value": "days,hours,minutes,seconds",
          "input": {
            "type": "text",
            "label": "Label Text (comma-separated)",
            "group": "display-options"
          }
        },
        "plural": {
          "value": "true",
          "input": {
            "type": "checkbox",
            "label": "Use Plural Labels",
            "group": "display-options"
          }
        },
        "enableUtc": {
          "value": "false",
          "input": {
            "type": "checkbox",
            "label": "Use UTC Time",
            "group": "time-settings"
          }
        },
        "refresh": {
          "value": "500",
          "input": {
            "type": "select",
            "label": "Refresh Rate (ms)",
            "group": "time-settings",
            "options": [
              "500",
              "1000",
              "2000"
            ]
          }
        },
        "digitFontSize": {
          "value": "48",
          "input": {
            "type": "select",
            "label": "Digit Size (px)",
            "group": "typography",
            "options": [
              "32",
              "48",
              "64",
              "72",
              "96"
            ]
          }
        },
        "labelFontSize": {
          "value": "16",
          "input": {
            "type": "select",
            "label": "Label Size (px)",
            "group": "typography",
            "options": [
              "12",
              "14",
              "16",
              "18",
              "20"
            ]
          }
        },
        "fontFamily": {
          "value": "Arial",
          "input": {
            "type": "select",
            "label": "Font Family",
            "group": "typography",
            "options": [
              "Roboto Mono",
              "system-ui",
              "monospace",
              "Arial"
            ]
          }
        },
        "digitColor": {
          "value": "#ffffff",
          "input": {
            "type": "colorInput",
            "label": "Digit Color",
            "group": "colors"
          }
        },
        "labelColor": {
          "value": "#908cca",
          "input": {
            "type": "colorInput",
            "label": "Label Color",
            "group": "colors"
          }
        },
        "backgroundColor": {
          "value": "#1e1e1f",
          "input": {
            "type": "colorInput",
            "label": "Background Color",
            "group": "colors"
          }
        },
        "overrideBg": {
          "value": "false",
          "input": {
            "type": "checkbox",
            "label": "Override Background Color",
            "group": "colors"
          }
        },
        "sectionColor": {
          "value": "#4f3636",
          "input": {
            "type": "colorInput",
            "label": "Section Color",
            "group": "colors"
          }
        },
        "sectionSpacing": {
          "value": "40",
          "input": {
            "type": "select",
            "label": "Section Spacing (px)",
            "group": "layout",
            "options": [
              "10",
              "20",
              "30",
              "40"
            ]
          }
        },
        "zeroPad": {
          "value": "true",
          "input": {
            "type": "checkbox",
            "label": "Zero Padding",
            "group": "display-options"
          }
        },
        "countUp": {
          "value": "false",
          "input": {
            "type": "checkbox",
            "label": "Count Up After End",
            "group": "time-settings"
          }
        }
      }
    }, null, 2),
    html: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplycountdown.js@1.7.0/dist/themes/default.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplycountdown.js@1.7.0/dist/themes/dark.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplycountdown.js@1.7.0/dist/themes/cyber.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplycountdown.js@1.7.0/dist/themes/losange.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplycountdown.js@1.7.0/dist/themes/circle.css">
<div class="countdown-wrapper">
  <div class="simply-countdown"></div>
</div>`,
    css: `.countdown-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 2rem;
  box-sizing: border-box;
}

.simply-countdown {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--section-spacing);
}

.simply-countdown > .simply-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.simply-countdown > .simply-section > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.simply-countdown > .simply-section .simply-amount {
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin-bottom: 0.5em;
}

.simply-countdown > .simply-section .simply-word {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1;
}
.simply-countdown-losange{overflow:visible;display:flex;flex-wrap:wrap;justify-content:center;gap:3rem;font-family:Inter,sans-serif}.simply-countdown-losange>.simply-section{width:70px;height:70px;display:flex;justify-content:center;align-items:center;transform:rotate(-45deg);background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:.5rem;transition:.2s ease-in-out}.simply-countdown-losange>.simply-section>div{transform:rotate(45deg);display:flex;flex-direction:column;line-height:1.2}.simply-countdown-losange>.simply-section .simply-amount,.simply-countdown-losange>.simply-section .simply-word{display:block;text-align:center}.simply-countdown-losange>.simply-section .simply-amount{font-size:1.25rem;font-weight:700;color:#fff}.simply-countdown-losange>.simply-section .simply-word{font-size:.65rem;font-weight:500;color:rgba(255,255,255,.9);text-transform:uppercase;letter-spacing:.05em}@media (min-width:640px){.simply-countdown-losange>.simply-section{width:80px;height:80px}.simply-countdown-losange>.simply-section .simply-amount{font-size:1.5rem}.simply-countdown-losange>.simply-section .simply-word{font-size:.7rem}}@media (min-width:1024px){.simply-countdown-losange>.simply-section{width:90px;height:90px}.simply-countdown-losange>.simply-section .simply-amount{font-size:1.75rem}.simply-countdown-losange>.simply-section .simply-word{font-size:.75rem}}
.simply-countdown{overflow:hidden;display:flex;flex-wrap:wrap;justify-content:center;gap:1.25rem;font-family:Inter,system-ui,-apple-system,sans-serif}.simply-countdown>.simply-section{width:65px;height:65px;padding:1.5rem;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.9);border:1px solid rgba(226,232,240,.8);border-radius:1rem;box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -1px rgba(0,0,0,.03),0 0 0 1px rgba(0,0,0,.02);transition:.3s cubic-bezier(.4, 0, .2, 1);backdrop-filter:blur(10px)}.simply-countdown>.simply-section>div{display:flex;flex-direction:column;line-height:1;align-items:center}.simply-countdown>.simply-section .simply-amount{font-size:1.5rem;font-weight:700;color:#1e293b;line-height:1.2;letter-spacing:-.025em}.simply-countdown>.simply-section .simply-word{font-size:.6rem;font-weight:500;color:#64748b;text-transform:uppercase;letter-spacing:.1em}@media (min-width:640px){.simply-countdown>.simply-section{width:75px;height:75px;padding:1.75rem}.simply-countdown>.simply-section .simply-amount{font-size:1.75rem}.simply-countdown>.simply-section .simply-word{font-size:.75rem}}@media (min-width:1024px){.simply-countdown>.simply-section{width:90px;height:90px;padding:2rem}.simply-countdown>.simply-section .simply-amount{font-size:2rem}.simply-countdown>.simply-section .simply-word{font-size:.8rem}}
.simply-countdown-dark{overflow:hidden;display:flex;flex-wrap:wrap;justify-content:center;gap:1.25rem;font-family:Inter,system-ui,-apple-system,sans-serif}.simply-countdown-dark>.simply-section{width:65px;height:65px;padding:1.5rem;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.75);border:1px solid rgba(51,65,85,.6);border-radius:1rem;box-shadow:0 4px 6px -1px rgba(0,0,0,.2),0 2px 4px -1px rgba(0,0,0,.1),0 0 0 1px rgba(255,255,255,.05);transition:.3s cubic-bezier(.4, 0, .2, 1);backdrop-filter:blur(10px)}.simply-countdown-dark>.simply-section>div{display:flex;flex-direction:column;line-height:1;align-items:center}.simply-countdown-dark>.simply-section .simply-amount{font-size:1.5rem;font-weight:700;color:#f1f5f9;line-height:1.2;letter-spacing:-.025em}.simply-countdown-dark>.simply-section .simply-word{font-size:.6rem;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em}@media (min-width:640px){.simply-countdown-dark>.simply-section{width:75px;height:75px;padding:1.75rem}.simply-countdown-dark>.simply-section .simply-amount{font-size:1.75rem}.simply-countdown-dark>.simply-section .simply-word{font-size:.75rem}}@media (min-width:1024px){.simply-countdown-dark>.simply-section{width:90px;height:90px;padding:2rem}.simply-countdown-dark>.simply-section .simply-amount{font-size:2rem}.simply-countdown-dark>.simply-section .simply-word{font-size:.8rem}}
.simply-countdown-cyber{overflow:visible;display:flex;flex-wrap:wrap;justify-content:center;gap:1.75rem;font-family:Inter,system-ui,-apple-system,sans-serif;perspective:1000px}.simply-countdown-cyber>.simply-section{width:70px;height:70px;padding:1.5rem;position:relative;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(23,25,35,.9),rgba(15,17,25,.95));border-radius:.5rem;transition:.4s cubic-bezier(.175, .885, .32, 1.275);backdrop-filter:blur(12px);transform-style:preserve-3d}.simply-countdown-cyber>.simply-section::before{content:"";position:absolute;inset:-1px;background:linear-gradient(135deg,rgba(120,240,255,.2),rgba(255,90,220,.2));border-radius:.5rem;z-index:-1;opacity:0;transition:opacity .3s}.simply-countdown-cyber>.simply-section::after{content:"";position:absolute;inset:-2px;background:linear-gradient(135deg,#78f0ff,#ff5adc);border-radius:.5rem;z-index:-2;opacity:.15;filter:blur(4px);animation:4s ease-in-out infinite pulse}.simply-countdown-cyber>.simply-section .glass-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.05));border-radius:.5rem}.simply-countdown-cyber>.simply-section:hover{transform:translateY(-4px) translateZ(10px) rotateX(5deg);box-shadow:0 20px 40px -10px rgba(0,0,0,.5),0 0 20px rgba(120,240,255,.2),0 0 0 1px rgba(120,240,255,.1)}.simply-countdown-cyber>.simply-section:hover::before{opacity:1}.simply-countdown-cyber>.simply-section>div{display:flex;flex-direction:column;gap:.4rem;align-items:center;transform-style:preserve-3d}.simply-countdown-cyber>.simply-section .simply-amount{font-size:1.75rem;font-weight:700;background:linear-gradient(to bottom right,#78f0ff,#ff5adc);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 20px rgba(120,240,255,.3),0 0 40px rgba(120,240,255,.2);letter-spacing:-.02em;transform:translateZ(10px)}.simply-countdown-cyber>.simply-section .simply-word{font-size:.6rem;font-weight:500;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.7);transform:translateZ(5px);position:relative}.simply-countdown-cyber>.simply-section .simply-word::after{content:"";position:absolute;left:-10%;bottom:-4px;width:120%;height:1px;background:linear-gradient(to right,rgba(120,240,255,0),rgba(120,240,255,.5),rgba(255,90,220,.5),rgba(255,90,220,0))}@media (min-width:640px){.simply-countdown-cyber>.simply-section{width:80px;height:80px;padding:1.75rem}.simply-countdown-cyber>.simply-section .simply-amount{font-size:2rem}.simply-countdown-cyber>.simply-section .simply-word{font-size:.75rem}}@media (min-width:1024px){.simply-countdown-cyber>.simply-section{width:100px;height:100px;padding:2rem}.simply-countdown-cyber>.simply-section .simply-amount{font-size:2.5rem}.simply-countdown-cyber>.simply-section .simply-word{font-size:.8rem}}@keyframes pulse{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.25;transform:scale(1.05)}}
.simply-countdown-circle{--sc-circle-primary:#6366f1;--sc-circle-secondary:#818cf8;--sc-circle-bg:#1e1b4b;--sc-circle-text:#fff;display:flex;flex-wrap:wrap;justify-content:center;gap:1.5rem;font-family:Inter,sans-serif}.simply-countdown-circle>.simply-section{position:relative;width:100px;height:100px;padding:1rem;display:flex;align-items:center;justify-content:center;flex-direction:column;border-radius:50%;background:linear-gradient(45deg,var(--sc-circle-primary),var(--sc-circle-secondary));box-shadow:0 0 25px -5px var(--sc-circle-primary);animation:2s cubic-bezier(.4,0,.6,1) infinite pulse-circle}.simply-countdown-circle>.simply-section::before{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--sc-circle-bg);z-index:0}.simply-countdown-circle>.simply-section>div{position:relative;z-index:1;color:var(--sc-circle-text);text-align:center}.simply-countdown-circle .simply-amount{display:block;font-size:1.75rem;font-weight:700;line-height:1;background:linear-gradient(to right,var(--sc-circle-primary),var(--sc-circle-secondary));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}.simply-countdown-circle .simply-word{font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;opacity:.8}@keyframes pulse-circle{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.98);opacity:.9}}`,
    javascript: `const config = window.componentConfig.properties;

// Load simplyCountdown from CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/simplycountdown.js@1.7.0/dist/simplyCountdown.min.js'
document.head.appendChild(script);

script.onload = () => {
  const container = document.querySelector('.countdown-wrapper');
  
  try {
    const theme = config.theme.value === 'default' ? "simply-countdown" : 'simply-countdown-'+config.theme.value;
    // Apply container styles
    container.style.backgroundColor = config.backgroundColor.value;
    
    // Parse word labels
    const wordLabels = config.words.value.split(',').map(w => w.trim());
    
    const wordSettings = config.wordString.value === 'true' ? {} : {
      days: wordLabels[0] || 'days',
      hours: wordLabels[1] || 'hours',
      minutes: wordLabels[2] || 'minutes',
      seconds: wordLabels[3] || 'seconds',
      pluralLetter: config.plural.value === 'true' ? 's' : ''
    }

    // Set CSS custom properties
    document.documentElement.style.setProperty('--section-spacing', config.sectionSpacing.value+'px');
    const countdownEl = document.querySelector('.simply-countdown');
    countdownEl.classList.add(theme);
    // Initialize simplyCountdown
    simplyCountdown('.simply-countdown', {
      year: new Date(config.targetDate.value).getFullYear(),
      month: new Date(config.targetDate.value).getMonth() + 1,
      day: new Date(config.targetDate.value).getDate(),
      hours: new Date(config.targetDate.value).getHours(),
      minutes: new Date(config.targetDate.value).getMinutes(),
      seconds: new Date(config.targetDate.value).getSeconds(),
      words: wordSettings,
      plural: config.plural.value === 'true',
      inline: false,
      enableUtc: config.enableUtc.value === 'true',
      refresh: parseInt(config.refresh.value),
      inlineClass: 'simply-countdown-inline',
      wordClass: 'simply-word',
      zeroPad: config.zeroPad.value === 'true',
      countUp: config.countUp.value === 'true'
    });
    
    // Apply styles to countdown elements
    const amounts = document.querySelectorAll('.simply-amount');
    const words = document.querySelectorAll('.simply-word');
    
    amounts.forEach(amount => {
      amount.style.color = config.digitColor.value;
      amount.style.fontSize = config.digitFontSize.value+'px';
      amount.style.fontFamily = config.fontFamily.value;
    });
    words.forEach(word => {
      word.style.color = config.labelColor.value;
      word.style.fontSize = config.labelFontSize.value+'px';
      word.style.fontFamily = config.fontFamily.value;
      // word.style.display = config.wordString.value === 'true' || config.wordString.value === true  ? 'block' : 'none';
    });

    if(config.overrideBg.value === 'true') {
      const sections = document.querySelectorAll('.simply-section');
      sections.forEach(section => {
        section.style.backgroundColor = config.sectionColor.value;
      });
    }
    
  } catch(e) {
    console.error('Error initializing countdown:', e);
    container.innerHTML = '<div style="color: red;">Error initializing countdown timer</div>';
  }
};
`,
    lastModified: new Date().toISOString()
  }
];
