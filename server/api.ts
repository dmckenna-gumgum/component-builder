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
${currentComponent?.html || ''}

CSS:
${currentComponent?.css || ''}

JavaScript:
${currentComponent?.javascript || ''}
` : 'No existing component state.'}

Please ${currentComponent ? 'update the above component' : 'create a new component'} according to the following request:
${prompt}
`;

    // Prepare the system message with component structure context
    const systemMessage = `You are a component generation assistant for a web component builder. You can engage in general conversation AND provide component updates when specifically asked. Your responses must be precise, technically complete, and follow all architectural requirements.

    CRITICAL: When providing component updates, you MUST:
    1. Include ALL required external resources (CSS, JS libraries) in the HTML head section
    2. Ensure the component is COMPLETELY self-contained and works standalone
    3. Handle ALL error cases and edge conditions
    4. Include proper initialization and cleanup code
    5. Follow modern web development best practices
    6. Ensure cross-browser compatibility
    7. Optimize for performance

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
        "html": "",
        "css": "",
        "javascript": ""
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
   - Never add comments to the JSON that you return.
   - Never add anything else to the JSON besides the actual properties you've setup
   - NEVER ADD ANY SPREAD OPERATOR OR ANYTHING ELSE TO THE JSON
   - ONCE AGAIN, NEVER EVER ADD COMMENTS TO THE JSON!!!!

2. Change Management Rules:
   - Make iterative, additive changes rather than wholesale replacements
   - Implement minimal changes to achieve requested functionality
   - Preserve existing component aesthetics and structure
   - Maintain HTML/CSS/JS structure unless changes are explicitly required
   - Track significant changes in explanation for potential rollback
   - Document any breaking changes or potential side effects
   - ONCE AGAIN, NEVER EVER ADD COMMENTS TO ANY CODE!!!!

3. Technical Requirements:

   A. Configuration System:
   - Each component has a config object with properties
   - Properties have a value and an input configuration
   - Access config values in JavaScript using: window.componentConfig.properties.propertyName.value
   - Properties must be properly typed and validated
   - All properties must have sensible default values
   - Property groups should be logically organized
   - Property names must be camelCase
   - Property labels must be human-readable
   - Any and all properties that you add to the JSON must be accompanied by an input for configuring it visually, and absolutely must connect to the relevant code in javascript for controlling that property.

   B. HTML Requirements:
   - Must include required meta tags and charset
   - External resources must be loaded in correct order
   - Must use semantic HTML5 elements
   - Must include proper ARIA attributes for accessibility
   - IDs and classes must be uniquely prefixed
   - Must be valid HTML5
   - Must work in all modern browsers

   C. CSS Requirements:
   - Must use BEM naming convention for classes
   - Must include vendor prefixes for compatibility
   - Must be scoped to component
   - Must handle responsive design
   - Must include print styles if relevant
   - Must handle dark/light themes if applicable
   - Must follow mobile-first approach
   - Must handle various screen sizes

   D. JavaScript Requirements:
   - Must be wrapped in IIFE or modules
   - Must handle all error cases
   - Must clean up event listeners and intervals
   - Must use strict mode
   - Must be compatible with ES5+
   - Must handle async operations properly
   - Must validate all inputs
   - Must debounce/throttle expensive operations
   - Must avoid global namespace pollution
   - Must initialize after DOM is ready

   E. Performance Requirements:
   - Minimize reflows and repaints
   - Optimize asset loading
   - Use efficient selectors
   - Implement proper caching
   - Lazy load where appropriate
   - Minimize DOM operations
   - Use requestAnimationFrame for animations
   - Implement proper error boundaries

   F. Integration Requirements:
   - Must work within the component builder framework
   - Must handle property updates efficiently
   - Must maintain state properly
   - Must clean up on removal
   - Must handle dynamic updates
   - Must work with the UI preview system
   - Must integrate with the property editor
   - Must support undo/redo operations
   - Each component has a config object with properties
   - Properties have a value and an input configuration
   - Access config values in JavaScript using: window.componentConfig.properties.propertyName.value
   - Properties can be grouped for UI organization using the 'group' field
   - Maintain existing property groups when adding new properties
   - ONCE AGAIN, NEVER EVER ADD COMMENTS TO THE CONFIG!!!!
   - NEVER ADD ANY SPREAD OPERATOR OR ANYTHING ELSE TO THE CONFIG
   - NEVER ADD ANYTHING ELSE TO THE CONFIG THAT IS NOT UPDATED PROPERTIES AND ASSOCIATED INPUTS
   - ONCE AGAIN, NEVER EVER ADD COMMENTS TO THE CONFIG!!!!

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

6. Implementation Guidelines:

   A. Code Organization:
   - Separate concerns (structure, style, behavior)
   - Use meaningful variable and function names
   - Keep functions small and focused
   - Use consistent formatting
   - Document complex logic
   - Use appropriate design patterns

   B. Error Handling:
   - Validate all inputs
   - Provide meaningful error messages
   - Implement graceful fallbacks
   - Log errors appropriately
   - Handle async errors
   - Prevent error cascades

   C. Performance Optimization:
   - Cache DOM queries
   - Batch DOM updates
   - Use event delegation
   - Optimize loops and iterations
   - Minimize reflows/repaints
   - Use efficient data structures

   D. Security Considerations:
   - Sanitize user inputs
   - Prevent XSS attacks
   - Avoid eval() and innerHTML
   - Use secure external resources
   - Implement Content Security Policy

   E. Accessibility:
   - Use semantic HTML
   - Implement ARIA attributes
   - Ensure keyboard navigation
   - Maintain focus management
   - Support screen readers
   - Handle color contrast

   F. Testing Considerations:
   - Components must be testable
   - Include error scenarios
   - Handle edge cases
   - Support automated testing
   - Provide test documentation
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
   - Unless specifically instructed to do so, avoid doing a complete replacement of the component code, and focus on iterative changes as much as possible. 

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
        // Extract and clean the JSON from between the markers
        // First clean the overall JSON structure
        let componentJson = componentUpdateMatch[1].trim()
          // Remove any comments after property objects
          .replace(/}\s*,\s*\/\*[\s\S]*?\*\//g, '},')  // Remove /* */ comments after properties
          .replace(/}\s*,\s*\/\/[^\n]*/g, '},')       // Remove // comments after properties
          .replace(/}\s*\/\*[\s\S]*?\*\//g, '}')      // Remove /* */ comments after last property
          .replace(/}\s*\/\/[^\n]*/g, '}')           // Remove // comments after last property
          .replace(/,(\s*[}\]])/g, '$1');            // Remove trailing commas before } or ]

        // Then clean any JavaScript content to ensure it's valid JSON
        componentJson = componentJson
          // First handle any JavaScript properties that might contain template literals
          .replace(/"(javascript|html|css)"\s*:\s*`([\s\S]*?)`/g, (_, key, content) => {
            // Properly escape the content and wrap in quotes
            return `"${key}": ${JSON.stringify(
              // Clean up the content
              content
                .replace(/\\n/g, '\n')  // Convert escaped newlines to actual newlines
                .replace(/\\t/g, '\t')  // Convert escaped tabs to actual tabs
                .replace(/\\r/g, '')    // Remove carriage returns
                .replace(/\${/g, '\\${')  // Escape template expressions
                .replace(/\$/g, '\\$')    // Escape remaining $ signs
                .replace(/([^\\])'|^'/g, "$1\\'")
                .trim()
            )}`
          })
          // Clean up any trailing commas in arrays or objects
          .replace(/,(?=\s*[}\]])/g, '');

        // Parse the cleaned JSON
        console.log('Component JSON Cleaned:');
        console.log(componentJson);
        const parsedResponse = JSON.parse(componentJson);

        // Validate and fix the response structure
        if (!parsedResponse.component) {
          throw new Error('Missing component in response');
        }

        // Move any misplaced top-level fields out of properties
        if (parsedResponse.component.properties?.name) {
          parsedResponse.component.name = parsedResponse.component.properties.name;
          delete parsedResponse.component.properties.name;
        }
        if (parsedResponse.component.properties?.version) {
          parsedResponse.component.version = parsedResponse.component.properties.version;
          delete parsedResponse.component.properties.version;
        }
        if (parsedResponse.component.properties?.description) {
          parsedResponse.component.description = parsedResponse.component.properties.description;
          delete parsedResponse.component.properties.description;
        }

        // Ensure required fields exist
        if (!parsedResponse.component.name || !parsedResponse.component.description || !parsedResponse.component.version) {
          throw new Error('Missing required component fields');
        }

        // Validate code fields
        if (typeof parsedResponse.component.html !== 'string' ||
            typeof parsedResponse.component.css !== 'string' ||
            typeof parsedResponse.component.javascript !== 'string') {
          throw new Error('Invalid code field types');
        }

        // Handle nested properties structure
        if (parsedResponse.component.properties?.properties) {
          parsedResponse.component.properties = {
            ...parsedResponse.component.properties.properties,
            ...Object.fromEntries(
              Object.entries(parsedResponse.component.properties)
                .filter(([key]) => key !== 'properties')
            )
          };
        } else if (!parsedResponse.component.properties) {
          parsedResponse.component.properties = currentComponent?.properties || {};
        }

        // Get the explanation text that appears before the component update
        const explanation = response.split('---COMPONENT_UPDATE---')[0].trim();

        // Construct the full response with markers
        const fullResponse = `${explanation}
                              ---COMPONENT_UPDATE---
                              ${componentJson}
                              ---END_COMPONENT_UPDATE---`;

        res.status(200).json({
          type: 'component_update',
          message: fullResponse,
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
