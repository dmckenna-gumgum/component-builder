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
import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../utils/debounce';
import { CodeEditor, EditorRef } from './CodeEditor';
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
  // Editor refs
  const configEditorRef = useRef<EditorRef>(null);
  const htmlEditorRef = useRef<EditorRef>(null);
  const cssEditorRef = useRef<EditorRef>(null);
  const jsEditorRef = useRef<EditorRef>(null);
  const { id: urlId = 'new' } = useParams<{ id: string }>();
  const [componentId, setComponentId] = useState(urlId);
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [config, setConfigImmediate] = useState('');
  const [html, setHtmlImmediate] = useState('');
  const [css, setCssImmediate] = useState('');
  const [javascript, setJavascriptImmediate] = useState('');
  const [editorsReady, setEditorsReady] = useState(0);

  // Load saved component data
  useEffect(() => {
    shouldDebounce.current = false;
    
    if (urlId === 'new') {
      // Generate a new ID only when creating a new component
      setComponentId(Date.now().toString());
      // Set default values immediately
      setName('');
      setConfigImmediate(defaultConfig);
      setHtmlImmediate(defaultHtml);
      setCssImmediate(defaultCss);
      setJavascriptImmediate(defaultJavascript);
      return;
    }

    try {
      const savedComponents = JSON.parse(localStorage.getItem('components') || '[]');
      const savedComponent = savedComponents.find((c: ComponentData) => c.id === urlId);
      
      if (savedComponent) {
        console.log('Loading saved component:', savedComponent);
        // Load all values immediately
        setName(savedComponent.name);
        setConfigImmediate(savedComponent.config);
        setHtmlImmediate(savedComponent.html);
        setCssImmediate(savedComponent.css);
        setJavascriptImmediate(savedComponent.javascript);
      } else {
        console.error('Component not found:', urlId);
        toast({
          title: 'Error',
          description: 'Component not found',
          status: 'error',
          duration: 3000,
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading component:', error);
      toast({
        title: 'Error',
        description: 'Failed to load component',
        status: 'error',
        duration: 3000,
      });
      navigate('/');
    }
  }, [urlId, navigate, toast]);

  // Track editor readiness
  const onEditorReady = useCallback(() => {
    setEditorsReady(prev => prev + 1);
  }, []);

  // Format all editors once they're all ready and enable debouncing
  useEffect(() => {
    if (editorsReady === 4) { // All editors are ready
      // Format code
      configEditorRef.current?.editor?.formatCode?.();
      htmlEditorRef.current?.editor?.formatCode?.();
      cssEditorRef.current?.editor?.formatCode?.();
      jsEditorRef.current?.editor?.formatCode?.();
      // Enable debouncing for future updates
      shouldDebounce.current = true;
    }
  }, [editorsReady]);

  // Track if we should debounce updates
  const shouldDebounce = useRef(false);

  // Create debounced preview updater with 1 second delay
  const updatePreviews = useCallback(
    debounce(() => {
      if (!shouldDebounce.current) return;
      console.log('Updating previews after 1s of inactivity...');
      // Get current values from editors
      const newConfig = configEditorRef.current?.editor?.getValue() || '';
      const newHtml = htmlEditorRef.current?.editor?.getValue() || '';
      const newCss = cssEditorRef.current?.editor?.getValue() || '';
      const newJs = jsEditorRef.current?.editor?.getValue() || '';

      // Only update if the config is valid JSON
      try {
        // Validate config JSON
        JSON.parse(newConfig);
        // If validation passes, update all values
        setConfigImmediate(newConfig);
        setHtmlImmediate(newHtml);
        setCssImmediate(newCss);
        setJavascriptImmediate(newJs);
      } catch (error) {
        console.log('Invalid JSON in config, skipping preview update');
      }
    }, 1000), // Wait 1s after last change
    []
  );

  // Immediate setters that queue debounced preview updates
  const setConfig = useCallback((value: string) => {
    setConfigImmediate(value);
    if (editorsReady === 4) {
      configEditorRef.current?.editor?.formatCode?.();
      updatePreviews();
    }
  }, [editorsReady, updatePreviews]);

  const setHtml = useCallback((value: string) => {
    setHtmlImmediate(value);
    if (editorsReady === 4) {
      htmlEditorRef.current?.editor?.formatCode?.();
      updatePreviews();
    }
  }, [editorsReady, updatePreviews]);

  const setCss = useCallback((value: string) => {
    setCssImmediate(value);
    if (editorsReady === 4) {
      cssEditorRef.current?.editor?.formatCode?.();
      updatePreviews();
    }
  }, [editorsReady, updatePreviews]);

  const setJavascript = useCallback((value: string) => {
    setJavascriptImmediate(value);
    if (editorsReady === 4) {
      jsEditorRef.current?.editor?.formatCode?.();
      updatePreviews();
    }
  }, [editorsReady, updatePreviews]);

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
      id: componentId,
      name: name.trim(),
      config,
      html,
      css,
      javascript,
      lastModified: new Date().toISOString(),
    };

    console.log(componentData);

    // Get existing components or initialize empty array
    const savedComponents = JSON.parse(localStorage.getItem('components') || '[]');
    
    // Update or add new component
    const componentIndex = savedComponents.findIndex((c: ComponentData) => c.id === componentData.id);
    console.log('found existing component at index', componentIndex)
    if (componentIndex >= 0) {
      savedComponents[componentIndex] = componentData;
      console.log('updated existing component at index', savedComponents[componentIndex]);
    } else {
      savedComponents.push(componentData);
    }
    console.log(savedComponents);
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
    if (urlId !== 'new') {
      const savedComponents = JSON.parse(localStorage.getItem('components') || '[]');
      const component = savedComponents.find((c: ComponentData) => c.id === urlId);
      
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
  }, [urlId]);



  // Cleanup when navigating away
  useEffect(() => {
    return () => {
      // Clear state when unmounting
      setName('');
      setConfigImmediate('');
      setHtmlImmediate('');
      setCssImmediate('');
      setJavascriptImmediate('');
      setEditorsReady(0);
      shouldDebounce.current = false;
    };
  }, []);

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
                    {/* JSON Editor */}
                  <CodeEditor
                    ref={configEditorRef}
                    language="json"
                    value={config}
                    onChange={(value) => setConfig(value || '')}
                    onMount={onEditorReady}
                  />
                </TabPanel>
                <TabPanel height="100%" padding={0}>
                  {/* HTML Editor */}
                  <CodeEditor
                    ref={htmlEditorRef}
                    language="html"
                    value={html}
                    onChange={(value) => setHtml(value || '')}
                    onMount={onEditorReady}
                  />
                </TabPanel>
                <TabPanel height="100%" padding={0}>
                  {/* CSS Editor */}
                  <CodeEditor
                    ref={cssEditorRef}
                    language="css"
                    value={css}
                    onChange={(value) => setCss(value || '')}
                    onMount={onEditorReady}
                  />
                </TabPanel>
                <TabPanel height="100%" padding={0}>
                  {/* JavaScript Editor */}
                  <CodeEditor
                    ref={jsEditorRef}
                    language="javascript"
                    value={javascript}
                    onChange={(value) => setJavascript(value || '')}
                    onMount={onEditorReady}
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
                currentComponent={{
                  name,
                  properties: (() => {
                    try {
                      return JSON.parse(config || '{}');
                    } catch (error) {
                      return {};
                    }
                  })(),
                  html,
                  css,
                  javascript
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
            {/* UI Preview
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
            </Box> */}
          </VStack>
        </Panel>
      </PanelGroup>
    </Box>
  );
};
