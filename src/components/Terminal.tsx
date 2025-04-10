import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  useToast,
  Code,
} from '@chakra-ui/react';

interface Property {
  value: string;
  input: {
    type: string;
    label: string;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    group?: string;
  };
}

interface TerminalProps {
  onGenerateComponent: (response: any) => void;
  currentComponent?: {
    name?: string;
    description?: string;
    version?: string;
    properties?: Record<string, any>;
    html?: string;
    css?: string;
    javascript?: string;
  };
}

export const Terminal: React.FC<TerminalProps> = ({ onGenerateComponent, currentComponent }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ type: 'input' | 'output', content: string }[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Scroll to bottom when history updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user input to history
    setHistory(prev => [...prev, { type: 'input', content: input }]);
    
    try {
      // Clean up the code before sending
      const cleanedComponent = currentComponent ? {
        ...currentComponent,
        html: currentComponent.html?.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/;\s*([}\n])/g, '$1').trim(),
        css: currentComponent.css?.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/;\s*([}\n])/g, '$1').trim(),
        javascript: currentComponent.javascript?.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/([^;{}])\s*([}\n])/g, '$1;$2').trim()
      } : null;

      const response = await fetch('http://localhost:3001/api/generate-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: input,
          currentComponent: cleanedComponent
        }),
      });

      const responseData = await response.json();
      
      if (responseData.type === 'component_update') {
        // Extract component update section from the message
        const startMarker = '---COMPONENT_UPDATE---';
        const endMarker = '---END_COMPONENT_UPDATE---';
        const startIndex = responseData.message.indexOf(startMarker);
        const endIndex = responseData.message.indexOf(endMarker);
        
        if (startIndex === -1 || endIndex === -1) {
          throw new Error('Invalid response format: Missing component update markers');
        }
        
        // Extract the JSON string between markers
        const jsonString = responseData.message.slice(startIndex + startMarker.length, endIndex);
      
        try {
          // Use the component data directly from the response if available
          const parsedData = responseData.component ? 
            { 
              component: responseData.component,
              explanation: responseData.message.split('---COMPONENT_UPDATE---')[0].trim()
            } : 
            JSON.parse(jsonString.trim());
          
          if (!parsedData.component) {
            throw new Error('Invalid component data structure');
          }

          // Add response to history with formatting
          setHistory(prev => [
            ...prev,
            { 
              type: 'output',
              content: `${responseData.message}\n\nComponent Updates:\n- Name: ${parsedData.component?.name || 'No name provided'}\n- Properties: ${Object.keys(parsedData.component?.properties || {}).length} properties updated\n- HTML: ${parsedData.component?.html ? 'Updated' : 'No changes'}\n- CSS: ${parsedData.component?.css ? 'Updated' : 'No changes'}\n- JavaScript: ${parsedData.component?.javascript ? 'Updated' : 'No changes'}`
            }
          ]);
          
          // Get the new properties from the response
          const newProperties = parsedData.component.properties || {};

          // Get existing properties, ensuring we don't include any top-level fields
          const existingProperties: Record<string, Property> = {};
          if (currentComponent?.properties) {
            // Parse the existing properties if they're in string format
            const currentProps = typeof currentComponent.properties === 'string' ?
              JSON.parse(currentComponent.properties) :
              currentComponent.properties;

            // Only copy over valid property entries (with value and input)
            Object.entries(currentProps).forEach(([key, prop]: [string, any]) => {
              if (prop && prop.value !== undefined && prop.input) {
                existingProperties[key] = prop;
              }
            });
          }

          // Merge properties, new values take precedence
          const mergedProperties = {
            ...existingProperties,
            ...newProperties
          };

          // Create the properly structured component data
          const componentData = {
            name: parsedData.component.name,
            version: parsedData.component.version,
            description: parsedData.component.description,
            html: parsedData.component.html,
            css: parsedData.component.css,
            javascript: parsedData.component.javascript,
            config: JSON.stringify({
              name: parsedData.component.name,
              version: parsedData.component.version,
              description: parsedData.component.description,
              properties: mergedProperties
            }, null, 2)
          };
          onGenerateComponent(componentData);
        } catch (error) {
          const jsonError = error as Error;
          console.error('Failed to parse component update:', jsonError);
          throw new Error(`Invalid component update structure: ${jsonError.message}`);
        }
      } else {
        // Just show the conversation response
        setHistory(prev => [
          ...prev,
          { 
            type: 'output',
            content: responseData.message
          }
        ]);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Failed to generate component',
        status: 'error',
        duration: 3000,
      });
      setHistory(prev => [...prev, { type: 'output', content: 'Error: Failed to generate component' }]);
    }

    setInput('');
  };

  return (
    // Terminal UI
    <Box
      bg="black"
      color="green.300"
      p={4}
      borderRadius="md"
      height="100%"
      overflow="auto"
      fontFamily="mono"
    >
      <VStack align="stretch" spacing={2}>
        {history.map((entry: { type: 'input' | 'output', content: string }, index: number) => (
          <Box key={index}>
            {entry.type === 'input' ? (
              <Text>
                <Text as="span" color="blue.300">{'> '}</Text>
                {entry.content}
              </Text>
            ) : (
              <Code
                display="block"
                whiteSpace="pre-wrap"
                bg="transparent"
                color="green.300"
                children={entry.content}
              />
            )}
          </Box>
        ))}
        <Box ref={terminalEndRef}>
          <form onSubmit={handleSubmit}>
            <Input
              variant="unstyled"
              placeholder="Type your component request..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              color="green.300"
              _placeholder={{ color: 'green.500' }}
              spellCheck={false}
            />
          </form>
        </Box>
      </VStack>
    </Box>
  );
};
