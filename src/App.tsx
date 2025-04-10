import { Box, Container, Heading, VStack } from '@chakra-ui/react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ComponentEditor } from './components/ComponentEditor';
import { ComponentGrid, ComponentData } from './components/ComponentGrid';
import { useEffect, useState } from 'react';
import { defaultComponents } from './templates/defaultComponents';

function HomePage() {
  const [savedComponents, setSavedComponents] = useState<ComponentData[]>([]);
  const location = useLocation();

  // Load components when navigating to home page
  useEffect(() => {
    if (location.pathname === '/') {
      const savedComponentsStr = localStorage.getItem('components');
      let components: ComponentData[] = [];
      
      if (savedComponentsStr) {
        try {
          components = JSON.parse(savedComponentsStr);
        } catch (e) {
          console.error('Failed to parse saved components:', e);
          components = [];
        }
      }

      // Add default components if they don't exist
      defaultComponents.forEach(defaultComponent => {
        if (!components.some(c => c.id === defaultComponent.id)) {
          components.push(defaultComponent);
        }
      });

      // Save back to localStorage and update state
      localStorage.setItem('components', JSON.stringify(components));
      setSavedComponents(components);
    }
  }, [location]);

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center" color="blue.600">
            Component Builder
          </Heading>
          <ComponentGrid savedComponents={savedComponents} />
        </VStack>
      </Container>
    </Box>
  );
}

function App() {
  // Use the basename for GitHub Pages
  const basename = process.env.NODE_ENV === 'production' ? '/component-builder' : '';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:id" element={<ComponentEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
