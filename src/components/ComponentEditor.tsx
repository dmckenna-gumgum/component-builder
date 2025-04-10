import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useState, useEffect } from 'react';
import { CodeEditor } from './CodeEditor';
import { ComponentPreview } from './ComponentPreview';
import { UIPreview } from './UIPreview';
import { defaultConfig, defaultHtml, defaultCss, defaultJavascript } from '../templates';
import { Terminal } from './Terminal';

interface ComponentData {
  id: string;
  name: string;
  config: string;
  html: string;
  css: string;
  javascript: string;
  lastModified: string;
}

export const ComponentEditor = () => {
  const { id = 'new' } = useParams<{ id: string }>();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [config, setConfig] = useState(defaultConfig);
  const [html, setHtml] = useState(defaultHtml);
  const [css, setCss] = useState(defaultCss);
  const [javascript, setJavascript] = useState(defaultJavascript);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a component name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const componentData: ComponentData = {
      id: id === 'new' ? Date.now().toString() : id,
      name: name.trim(),
      config,
      html,
      css,
      javascript,
      lastModified: new Date().toISOString(),
    };

    // Get existing components or initialize empty array
    const savedComponents = JSON.parse(localStorage.getItem('components') || '[]');
    
    // Update or add new component
    const componentIndex = savedComponents.findIndex((c: ComponentData) => c.id === componentData.id);
    if (componentIndex >= 0) {
      savedComponents[componentIndex] = componentData;
    } else {
      savedComponents.push(componentData);
    }

    // Save back to localStorage
    localStorage.setItem('components', JSON.stringify(savedComponents));

    toast({
      title: 'Success',
      description: 'Component saved successfully',
      status: 'success',
      duration: 3000,
    });

    // Stay on the page after saving
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        // Only handle save if the event target is not inside UIPreview
        const uiPreview = document.querySelector('[data-ui-preview]');
        if (!uiPreview?.contains(e.target as Node)) {
          e.preventDefault();
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Update config when name changes
  useEffect(() => {
    if (!name || !config) return;
    
    try {
      const configObj = JSON.parse(config);
      if (configObj.name !== name) {
        configObj.name = name;
        setConfig(JSON.stringify(configObj, null, 2));
      }
    } catch (e) {
      // Don't reset the config if it's invalid, just log the error
      console.error('Failed to update config with new name:', e);
    }
  }, [name, config]);

  // Load component data when editing an existing component
  useEffect(() => {
    if (id !== 'new') {
      const savedComponents = JSON.parse(localStorage.getItem('components') || '[]');
      const component = savedComponents.find((c: ComponentData) => c.id === id);
      
      if (component) {
        setName(component.name);
        setConfig(component.config);
        setHtml(component.html);
        setCss(component.css);
        setJavascript(component.javascript);
      }
    } else {
      // Set default values for new component
      setName('');
      setConfig(defaultConfig);
      setHtml(defaultHtml);
      setCss(defaultCss);
      setJavascript(defaultJavascript);
    }
  }, [id]);



  return (
    <Box height="100vh" width="100vw" overflow="hidden">
      <Box px={4} py={2} borderBottomWidth="1px">
        <Flex justify="space-between" align="center" maxW="100%" gap={4}>
          <HStack spacing={4}>
            <IconButton
              aria-label="Back to home"
              icon={<ArrowBackIcon />}
              size="lg"
              variant="ghost"
              onClick={() => navigate('/')}
            />
            <Input
              placeholder="Enter component name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxW="400px"
              size="lg"
            />
          </HStack>
          <Button colorScheme="blue" size="lg" onClick={handleSave}>
            Save Component
          </Button>
        </Flex>
      </Box>

      <PanelGroup 
        direction="horizontal" 
        style={{ height: 'calc(100vh - 66px)' }}
        autoSaveId="component-editor-layout"
        onLayout={(sizes) => {
          // Do nothing - let the debounced resize handler in ComponentPreview handle it
        }}
        className="no-resize-observer"
      >
        {/* Editor Panel */}
        <Panel defaultSize={50} minSize={30}>
          <VStack height="100%" spacing={0}>
            {/* Code Editor Tabs */}
            <Box height="70%" width="100%" overflow="hidden">
              <Tabs height="100%" display="flex" flexDirection="column">
              <TabList>
                <Tab>Config</Tab>
                <Tab>HTML</Tab>
                <Tab>CSS</Tab>
                <Tab>JavaScript</Tab>
              </TabList>

              <TabPanels flex={1} overflow="auto">
                <TabPanel height="100%" padding={0}>
                  <CodeEditor
                    language="json"
                    value={config}
                    onChange={(value) => setConfig(value || '')}
                  />
                </TabPanel>
                <TabPanel height="100%" padding={0}>
                  <CodeEditor
                    language="html"
                    value={html}
                    onChange={(value) => setHtml(value || '')}
                  />
                </TabPanel>
                <TabPanel height="100%" padding={0}>
                  <CodeEditor
                    language="css"
                    value={css}
                    onChange={(value) => setCss(value || '')}
                  />
                </TabPanel>
                <TabPanel height="100%" padding={0}>
                  <CodeEditor
                    language="javascript"
                    value={javascript}
                    onChange={(value) => setJavascript(value || '')}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
            </Box>
            
            {/* Terminal Panel */}
            <Box height="30%" width="100%" borderTopWidth="1px" overflow="hidden">
              <Terminal
                onGenerateComponent={(componentData) => {
                  if (componentData.config) setConfig(componentData.config);
                  if (componentData.html) setHtml(componentData.html);
                  if (componentData.css) setCss(componentData.css);
                  if (componentData.javascript) setJavascript(componentData.javascript);
                  if (componentData.name) setName(componentData.name);
                }}
              />
            </Box>
          </VStack>
        </Panel>

        <PanelResizeHandle style={{ width: '4px', background: '#E2E8F0' }} />

        {/* Preview Column */}
        <Panel defaultSize={50} minSize={30}>
          <VStack height="100%" spacing={4} p={4}>
            {/* Component Preview */}
            <Box
              width="100%"
              height="50%"
              borderWidth="1px"
              borderRadius="md"
              display="flex"
              flexDirection="column"
              justifyContent="stretch"              
              p={4}
              overflow="auto"
            >
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                Component Preview
              </Text>
              <ComponentPreview
                html={html} 
                css={css} 
                javascript={`window.componentConfig = ${config};\n${javascript}`} 
                componentName={name || 'New Component'}
              />
            </Box>
            {/* UI Preview */}
            <Box
              width="100%"
              height="50%"
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="white"
              overflow="auto"
              data-ui-preview
            >
              <UIPreview config={config} onConfigChange={setConfig} onSave={handleSave} />
            </Box>
          </VStack>
        </Panel>
      </PanelGroup>
    </Box>
  );
};
