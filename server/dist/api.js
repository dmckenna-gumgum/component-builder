import { Router } from 'express';
import fetch from 'node-fetch';
const router = Router();
async function callOpenAI(messages) {
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
    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No response content from OpenAI');
    }
    return content;
}
router.post('/generate-component', async (req, res) => {
    try {
        const { prompt } = req.body;
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
              "type": "text|number|select|colorInput|checkbox",
              "label": "Human readable label",
              "group": "Group name for UI organization"
            }
          }
        },
        "html": "<!-- HTML content -->",
        "css": "/* CSS content */",
        "javascript": "// JavaScript content"
      }
    }
    ---END_COMPONENT_UPDATE---

    Only include this structure when you are specifically updating the component. For general conversation or explanations, respond normally without this structure.

    Component Guidelines:
    1. Components are built using HTML, CSS, and JavaScript
    2. Configuration is handled through a JSON structure
    3. Input types supported: text, number, select, colorInput, checkbox
    4. Properties can be grouped in the UI`;
        const response = await callOpenAI([
            { role: "system", content: systemMessage },
            { role: "user", content: prompt }
        ]);
        const componentUpdateMatch = response.match(/---COMPONENT_UPDATE---(.*?)---END_COMPONENT_UPDATE---/s);
        if (componentUpdateMatch) {
            try {
                const componentJson = componentUpdateMatch[1].trim();
                const parsedResponse = JSON.parse(componentJson);
                if (!parsedResponse.component ||
                    !parsedResponse.component.config ||
                    !parsedResponse.component.html ||
                    !parsedResponse.component.css ||
                    !parsedResponse.component.javascript) {
                    throw new Error('Invalid component structure in response');
                }
                const explanation = response.split('---COMPONENT_UPDATE---')[0].trim();
                res.status(200).json({
                    type: 'component_update',
                    message: explanation,
                    component: parsedResponse.component
                });
            }
            catch (parseError) {
                console.error('Error parsing component update:', parseError);
                if (parseError instanceof Error) {
                    throw new Error(`Invalid component update structure: ${parseError.message}`);
                }
                else {
                    throw new Error('Invalid component update structure');
                }
            }
        }
        else {
            res.status(200).json({
                type: 'conversation',
                message: response
            });
        }
    }
    catch (error) {
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
//# sourceMappingURL=api.js.map