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
    console.log('Current component:', currentComponent);
    // Always prepare the current component state message
    const currentStateMessage = `
Current Component State:
${currentComponent ? `
Component Details:
${JSON.stringify({
  name: currentComponent.name || 'ComponentName',
  description: currentComponent.description || 'Description of the component',
  version: currentComponent.version || '1.0.0'
}, null, 2)}

Properties:
${JSON.stringify(currentComponent?.properties || currentComponent?.config || {}, null, 2)}

HTML:
${currentComponent?.html || '<!-- No HTML content yet -->'}

CSS:
${currentComponent?.css || '/* No CSS content yet */'}

JavaScript:
${currentComponent?.javascript || '// No JavaScript content yet'}
` : 'No existing component state.'}

Please ${currentComponent ? 'update the above component' : 'create a new component'} according to the following request:
${prompt}
`;

    // Prepare the system message with component structure context
    const systemMessage = `You are a component generation assistant for a web component builder. You can engage in general conversation AND provide component updates when specifically asked.

    When you need to provide component updates, your response must include the special markers and JSON structure below:

    ---COMPONENT_UPDATE---
    {
      "explanation": "Your detailed explanation of changes",
      "component": {
        "name": "ComponentName",
        "description": "Description of the component",
        "version": "1.0.0",
        "properties": {
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

1. JSON Schema Requirements:
   - ALWAYS maintain the standard schema structure using a "properties" object
   - Each property MUST have both "value" and "input" fields
   - NEVER modify top-level component fields (name, description, version)
   - Preserve existing property structure and only modify necessary values
   - All changes must maintain backward compatibility
   - Keep property names consistent with existing schema

2. Change Management Rules:
   - Make iterative, additive changes rather than wholesale replacements
   - Implement minimal changes to achieve requested functionality
   - Preserve existing component aesthetics and structure
   - Maintain HTML/CSS/JS structure unless changes are explicitly required
   - Track significant changes in explanation for potential rollback
   - Document any breaking changes or potential side effects

3. Configuration System:
   - Each component has a config object with properties
   - Properties have a value and an input configuration
   - Access config values in JavaScript using: window.componentConfig.properties.propertyName.value
   - Properties can be grouped for UI organization using the 'group' field
   - Maintain existing property groups when adding new properties

4. Input Types Supported:
   - text: Text input with optional placeholder
   - number: Numeric input with optional min/max/step
   - select: Dropdown with options array
   - colorInput: Color picker that returns hex values
   - checkbox: Boolean input that returns "true"/"false" as strings
   - radio: Radio button group with options array
   - range: Slider input with min/max/step

5. Component Structure:
   - HTML: Main component markup
   - CSS: Component styles (automatically scoped to component)
   - JavaScript: Component logic
     - Runs in browser context
     - Has access to window.componentConfig
     - Should be wrapped in try/catch for error handling
     - Can use external CDN resources (add <script> tags in HTML)

6. Best Practices:
   - Use unique IDs and class names to avoid conflicts
   - Implement error handling in JavaScript
   - Provide reasonable default values
   - Group related properties together
   - Add descriptive labels for all inputs
   - Support responsive design
   - Include loading and error states
   - Preserve existing functionality when adding new features
   - Document dependencies and external resources

7. Example Property Groups:
   - layout: width, height, padding, margin
   - colors: background, text, borders
   - typography: font size, family, weight
   - behavior: intervals, animations, transitions
   - content: text, labels, headings
   - display-options: show/hide elements

8. State Management:
   - Maintain awareness of current component state
   - Reference existing property values when making updates
   - Preserve user-configured values during updates
   - Support rollback of changes if needed
   - Track component version history in explanations

Only include the COMPONENT_UPDATE structure when specifically updating the component. For general conversation or explanations, respond normally without this structure.

When making changes:
1. First analyze the current component state
2. Identify the minimal changes needed
3. Preserve existing structure and functionality
4. Document changes clearly in the explanation
5. Include rollback instructions if needed`;

    const response = await callOpenAI([
      { role: "system", content: systemMessage },
      { role: "user", content: currentStateMessage }
    ]);
    
    // Check if response contains a component update
    const componentUpdateMatch = response.match(/---COMPONENT_UPDATE---(.*?)---END_COMPONENT_UPDATE---/s);
    console.log('Response:', response);
    if (componentUpdateMatch) {
      console.log('Component update found:', componentUpdateMatch[1]);
      try {
        // Extract and parse the JSON from between the markers
        const componentJson = componentUpdateMatch[1].trim();
        const parsedResponse = JSON.parse(componentJson);

        // Validate the response structure
        if (!parsedResponse.component || 
            !parsedResponse.component.name ||
            !parsedResponse.component.description ||
            !parsedResponse.component.version ||
            !parsedResponse.component.properties ||
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
