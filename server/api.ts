import { Router } from 'express';
import { fetch } from 'undici';

const router = Router();

// Helper function to handle OpenAI API calls
async function callOpenAI(messages: Array<{ role: string; content: string }>) {
  console.log('API Key available:', process.env.OPENAI_API_KEY ? '***[exists]***' : '***[missing]***');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json() as {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };

  const content = result.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response content from OpenAI');
  }
  
  // Ensure content is always a string
  if (typeof content !== 'string') {
    console.warn('OpenAI response content was not a string, converting...');
    return String(content);
  }

  return content;
}

router.post('/generate-component', async (req, res) => {
  try {
    const { prompt, currentComponent } = req.body;

    // Prepare the current component state message
    let currentStateMessage = '';
    if (currentComponent) {
      currentStateMessage = `
Current Component State:

Config:
${JSON.stringify(currentComponent.config, null, 2)}

HTML:
${currentComponent.html}

CSS:
${currentComponent.css}

JavaScript:
${currentComponent.javascript}

Please update the above component according to the following request:
${prompt}
`;
    }

    // Prepare the system message with component structure context
    const systemMessage = `You are a component generation assistant for a web component builder. You can engage in general conversation AND provide component updates when specifically asked.

    When you need to provide component updates, your response must include the special markers and JSON structure below:

    ---COMPONENT_UPDATE---
    {
      "explanation": "Your detailed explanation of changes",
      "component": {
        "name": "ComponentName",
        "config": {
          "propertyName": {
            "value": "defaultValue",
            "input": {
              "type": "text|number|select|colorInput|checkbox|radio|range",
              "label": "Human readable label",
              "group": "Group name for UI organization",
              "options": ["option1", "option2"],  // For select and radio types
              "min": 0,       // For range and number types
              "max": 100,     // For range and number types
              "step": 1,      // For range and number types
              "placeholder": "Enter value..."  // For text type
            }
          }
        },
        "html": "<!-- HTML content -->",
        "css": "/* CSS content */",
        "javascript": "// JavaScript content"
      }
    }
    ---END_COMPONENT_UPDATE---

    Component Architecture Guidelines:
    1. Configuration System:
       - Each component has a config object with properties
       - Properties have a value and an input configuration
       - Access config values in JavaScript using: window.componentConfig.properties.propertyName.value
       - Properties can be grouped for UI organization using the 'group' field

    2. Input Types Supported:
       - text: Text input with optional placeholder
       - number: Numeric input with optional min/max/step
       - select: Dropdown with options array
       - colorInput: Color picker that returns hex values
       - checkbox: Boolean input that returns "true"/"false" as strings
       - radio: Radio button group with options array
       - range: Slider input with min/max/step

    3. Component Structure:
       - HTML: Main component markup
       - CSS: Component styles (automatically scoped to component)
       - JavaScript: Component logic
         - Runs in browser context
         - Has access to window.componentConfig
         - Should be wrapped in try/catch for error handling
         - Can use external CDN resources (add <script> tags in HTML)

    4. Best Practices:
       - Use unique IDs and class names to avoid conflicts
       - Implement error handling in JavaScript
       - Provide reasonable default values
       - Group related properties together
       - Add descriptive labels for all inputs
       - Support responsive design
       - Include loading and error states

    5. Example Property Groups:
       - layout: width, height, padding, margin
       - colors: background, text, borders
       - typography: font size, family, weight
       - behavior: intervals, animations, transitions
       - content: text, labels, headings
       - display-options: show/hide elements

    Only include the COMPONENT_UPDATE structure when specifically updating the component. For general conversation or explanations, respond normally without this structure.`;

    const response = await callOpenAI([
      { role: "system", content: systemMessage },
      { role: "user", content: currentComponent ? currentStateMessage : prompt }
    ]);
    
    // Check if response contains a component update
    const componentUpdateMatch = response.match(/---COMPONENT_UPDATE---(.*?)---END_COMPONENT_UPDATE---/s);

    if (componentUpdateMatch) {
      try {
        // Extract and parse the JSON from between the markers
        const componentJson = componentUpdateMatch[1].trim();
        const parsedResponse = JSON.parse(componentJson);

        // Validate the response structure
        if (!parsedResponse.component || 
            !parsedResponse.component.config ||
            !parsedResponse.component.html ||
            !parsedResponse.component.css ||
            !parsedResponse.component.javascript) {
          throw new Error('Invalid component structure in response');
        }

        // Get the explanation text that appears before the component update
        const explanation = response.split('---COMPONENT_UPDATE---')[0].trim();

        res.status(200).json({
          type: 'component_update',
          message: explanation,
          component: parsedResponse.component
        });
      } catch (parseError) {
        console.error('Error parsing component update:', parseError);
        if (parseError instanceof Error) {
          throw new Error(`Invalid component update structure: ${parseError.message}`);
        } else {
          throw new Error('Invalid component update structure');
        }
      }
    } else {
      // This is a conversational response
      res.status(200).json({
        type: 'conversation',
        message: response
      });
    }
  } catch (error) {
    console.error('Error:', error);
    let errorMessage = 'Error processing request';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Stack trace:', error.stack);
    }

    res.status(500).json({
      message: errorMessage,
      type: 'error'
    });
  }
});

export default router;
