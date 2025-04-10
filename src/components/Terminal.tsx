import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  useToast,
  Code,
} from '@chakra-ui/react';

interface TerminalProps {
  onGenerateComponent: (response: any) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onGenerateComponent }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output', content: string }>>([]);
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
      const response = await fetch('http://localhost:3001/api/generate-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      
      // Add response to history with formatting
      if (data.type === 'component_update') {
        setHistory(prev => [
          ...prev,
          { 
            type: 'output',
            content: `${data.message}\n\nComponent Updates:\n- Name: ${data.component?.name || 'No name provided'}\n- Config: Updated with ${Object.keys(data.component?.config || {}).length} properties\n- HTML: ${data.component?.html ? 'Updated' : 'No changes'}\n- CSS: ${data.component?.css ? 'Updated' : 'No changes'}\n- JavaScript: ${data.component?.javascript ? 'Updated' : 'No changes'}`
          }
        ]);
        // Pass component data to parent
        onGenerateComponent(data.component);
      } else {
        // Just show the conversation response
        setHistory(prev => [
          ...prev,
          { 
            type: 'output',
            content: data.message
          }
        ]);
      }
    } catch (error) {
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
        {history.map((entry, index) => (
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
