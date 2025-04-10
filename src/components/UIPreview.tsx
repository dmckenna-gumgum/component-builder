import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
  SimpleGrid,
  HStack,
  Switch,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface PropertyInput {
  type: 'colorInput' | 'select' | 'text' | 'fileInput' | 'number' | 'range' | 'date' | 
        'time' | 'datetime-local' | 'checkbox' | 'radio' | 'password' | 'email' | 'tel' | 'url';
  label: string;
  options?: string[];
  accept?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  placeholder?: string;
  group?: string;
}

interface Property {
  value: string;
  input: PropertyInput;
  group?: string;
}

interface ConfigProperties {
  [key: string]: Property;
}

interface Config {
  name: string;
  version: string;
  description: string;
  properties: ConfigProperties;
}

interface UIPreviewProps {
  config: string;
  onConfigChange: (newConfig: string) => void;
  onSave?: () => void;
}

export const UIPreview = ({ config, onConfigChange, onSave }: UIPreviewProps) => {
  const [parsedConfig, setParsedConfig] = useState<Config | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        const uiPreview = document.querySelector('[data-ui-preview]');
        if (uiPreview?.contains(e.target as Node)) {
          e.preventDefault();
          onSave?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  useEffect(() => {
    if (!config) return;
    
    try {
      const parsed = JSON.parse(config);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid config format');
      setParsedConfig(parsed);
    } catch (error) {
      console.error('Failed to parse config:', error);
      // Keep the previous config if it exists, don't reset to default
      setParsedConfig(prev => prev);
    }
  }, [config]);

  // Helper function to validate config structure
  const validateConfigStructure = (config: any): boolean => {
    if (!config) return false;
    if (typeof config !== 'object') return false;
    if (!config.properties || typeof config.properties !== 'object') return false;
    return true;
  };

  const handlePropertyChange = (propertyName: string, newValue: string) => {
    if (!parsedConfig) return;

    // Ensure we're not modifying top-level fields through properties
    if (['name', 'version', 'description'].includes(propertyName)) {
      console.warn(`Cannot modify ${propertyName} through properties`);
      return;
    }

    // Create new config preserving the correct structure
    const newConfig = {
      name: parsedConfig.name,
      version: parsedConfig.version,
      description: parsedConfig.description,
      properties: {
        ...parsedConfig.properties,
        [propertyName]: {
          ...parsedConfig.properties[propertyName],
          value: newValue,
        },
      },
    };

    setParsedConfig(newConfig);
    onConfigChange(JSON.stringify(newConfig, null, 2));
  };

  // Only show UI if we have a valid config structure
  if (!parsedConfig || !validateConfigStructure(parsedConfig)) return null;

  // Helper function to group properties by their group
  const groupProperties = (properties: ConfigProperties) => {
    const groups: { [key: string]: { [subgroup: string]: [string, Property][] } } = {
      ungrouped: { default: [] }
    };

    // Filter and process only valid property objects that have value and input fields
    Object.entries(properties).forEach(([name, prop]) => {
      if (!prop || typeof prop !== 'object' || !('value' in prop) || !('input' in prop)) {
        console.warn(`Skipping invalid property: ${name}`);
        return;
      }

      // Try to infer group from property name if not explicitly set
      const group = prop.group || inferPropertyGroup(name);
      const subgroup = prop.input?.group || 'default';

      if (!group) {
        groups.ungrouped.default.push([name, prop]);
        return;
      }

      if (!groups[group]) {
        groups[group] = {};
      }
      if (!groups[group][subgroup]) {
        groups[group][subgroup] = [];
      }
      groups[group][subgroup].push([name, prop]);
    });

    // Only include ungrouped if it has items
    if (groups.ungrouped.default.length === 0) {
      delete groups.ungrouped;
    }

    return groups;
  };

  // Helper function to infer property group from name
  const inferPropertyGroup = (propertyName: string): string | null => {
    const textProps = ['font', 'text', 'letter', 'line', 'word'];
    const layoutProps = ['width', 'height', 'padding', 'margin', 'gap', 'container', 'heightUnits', 'widthUnits'];
    const styleProps = [
      // Colors and backgrounds
      'color', 'background', 'bg', 'fill', 'stroke',
      // Borders
      'border', 'outline', 'shadow', 'ring',
      // Visual effects
      'opacity', 'blend', 'filter', 'backdrop', 'transform',
      // Display and visibility
      'display', 'visibility', 'overflow', 'clip', 'mask',
      // Positioning and stacking
      'position', 'float', 'clear', 'z', 'index',
      // Transitions and animations
      'transition', 'animation', 'motion',
      // Appearance
      'appearance', 'cursor', 'pointer', 'resize',
      // Shapes
      'radius', 'rounded', 'circle', 'square'
    ];

    const lowerName = propertyName.toLowerCase();
    
    if (textProps.some(prop => lowerName.includes(prop))) return 'Typography';
    if (layoutProps.some(prop => lowerName.includes(prop))) return 'Layout';
    if (styleProps.some(prop => lowerName.includes(prop))) return 'Style';
    
    return null;
  };

  // Helper function to estimate input width based on type and value
  const getInputWidth = (property: Property) => {
    const type = property.input.type;
    const value = property.value;

    switch (type) {
      case 'number':
      case 'range':
        return '120px';
      case 'colorInput':
        return '100px';
      case 'checkbox':
        return 'auto';
      case 'select':
        const maxOption = property.input.options?.reduce((a, b) => a.length > b.length ? a : b) || '';
        return `${Math.min(Math.max(maxOption.length * 10, 100), 200)}px`;
      case 'date':
        return '160px';
      case 'time':
        return '120px';
      case 'datetime-local':
        return '200px';
      default:
        // For text inputs, base width on current value length or placeholder
        const textLength = Math.max(
          value?.length || 0,
          property.input.placeholder?.length || 0,
          property.input.label.length
        );
        return `${Math.min(Math.max(textLength * 8, 80), 200)}px`;
    }
  };

  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm">
      <VStack spacing={6} align="stretch">
        {/* Component Info */}
        {parsedConfig.name && (
          <Box>
            <Text fontSize="lg" fontWeight="bold">{parsedConfig.name}</Text>
            {parsedConfig.description && (
              <Text fontSize="sm" color="gray.600">{parsedConfig.description}</Text>
            )}
          </Box>
        )}

        {/* Component Properties */}
        {Object.entries(groupProperties(parsedConfig?.properties || {})).map(([groupName, groupProps]) => (
          <Box 
            key={groupName} 
            bg="gray.50" 
            p={4} 
            borderRadius="md" 
            width="100%"
          >
            {groupName !== 'ungrouped' && (
              <Text fontSize="md" fontWeight="medium" mb={4} color="gray.700">
                {groupName}
              </Text>
            )}
            <Box display="flex" flexWrap="wrap" gap={6} alignItems="flex-start">
              {Object.entries(groupProps).map(([subgroup, props]) => (
                <Box 
                  key={subgroup} 
                  display="flex" 
                  flexWrap="wrap" 
                  gap={4} 
                  alignItems="flex-start"
                  bg={subgroup !== 'default' ? 'gray.100' : undefined}
                  p={subgroup !== 'default' ? 2 : undefined}
                  borderRadius={subgroup !== 'default' ? 'md' : undefined}
                >
                  {props.map(([propertyName, property]) => (
                    <FormControl key={propertyName} width="auto" flexGrow={0} flexShrink={0}>
                      <FormLabel fontSize="sm" mb={2}>{property.input.label}</FormLabel>
              
                      {property.input.type === 'colorInput' && (
                        <HStack spacing={3}>
                          <Input
                            type="color"
                            value={property.value}
                            onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                            width="60px"
                            height="35px"
                            padding={1}
                            borderRadius="md"
                          />
                          <Text fontSize="sm" color="gray.600">{property.value}</Text>
                        </HStack>
                      )}

                      {property.input.type === 'select' && property.input.options && (
                        <Select
                          size="sm"
                          value={property.value}
                          onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                          width={getInputWidth(property)}
                        >
                          {property.input.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </Select>
                      )}

                      {(property.input.type === 'text' || 
                        property.input.type === 'password' || 
                        property.input.type === 'email' || 
                        property.input.type === 'tel' || 
                        property.input.type === 'url') && (
                        <Input
                          size="sm"
                          type={property.input.type}
                          value={property.value}
                          onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                          placeholder={property.input.placeholder}
                          width={getInputWidth(property)}
                        />
              )}

                      {(property.input.type === 'number' || property.input.type === 'range') && (
                        <Input
                          size="sm"
                          type={property.input.type}
                          value={property.value}
                          onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                          min={property.input.min}
                          max={property.input.max}
                          step={property.input.step}
                          width={getInputWidth(property)}
                        />
              )}

                      {(property.input.type === 'date' || 
                        property.input.type === 'time' || 
                        property.input.type === 'datetime-local') && (
                        <Input
                          size="sm"
                          type={property.input.type}
                          value={property.value}
                          onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                          min={property.input.min}
                          max={property.input.max}
                          width={getInputWidth(property)}
                        />
              )}

                      {property.input.type === 'checkbox' && (
                        <Switch
                          size="md"
                          isChecked={property.value === 'true'}
                          onChange={(e) => handlePropertyChange(propertyName, e.target.checked.toString())}
                        />
              )}

                      {property.input.type === 'radio' && property.input.options && (
                        <RadioGroup
                          value={property.value}
                          onChange={(value) => handlePropertyChange(propertyName, value)}
                        >
                          <Stack direction="column" spacing={2}>
                            {property.input.options.map((option) => (
                              <Radio key={option} value={option} size="sm">
                                {option}
                              </Radio>
                            ))}
                          </Stack>
                        </RadioGroup>
              )}

                      {property.input.type === 'fileInput' && (
                        <Input
                          size="sm"
                          type="file"
                          accept={property.input.accept}
                          width={getInputWidth(property)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handlePropertyChange(propertyName, reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
              )}
                    </FormControl>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
