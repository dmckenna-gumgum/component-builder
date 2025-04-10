import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
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
}

interface Property {
  value: string;
  input: PropertyInput;
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
}

export const UIPreview = ({ config, onConfigChange }: UIPreviewProps) => {
  const [parsedConfig, setParsedConfig] = useState<Config | null>(null);

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

    const newConfig = {
      ...parsedConfig,
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
        // For text inputs, base width on current value length
        const length = value?.length || 0;
        return `${Math.min(Math.max(length * 10, 120), 300)}px`;
    }
  };

  return (
    <Box p={4}>
      {/* Component Properties */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={4}
        alignItems="flex-start"
      >
          {Object.entries(parsedConfig.properties).map(([propertyName, property]) => (
        <FormControl key={propertyName} flexBasis={getInputWidth(property)} flexShrink={0} flexGrow={0}>
          <FormLabel fontSize="sm">{property.input.label}</FormLabel>
          {property.input.type === 'colorInput' && (
            <Input
              type="color"
              value={property.value}
              onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
            />
          )}
          {property.input.type === 'select' && property.input.options && (
            <Select
              value={property.value}
              onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
            >
              {property.input.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}
          {(property.input.type === 'text' || 
            property.input.type === 'password' || 
            property.input.type === 'email' || 
            property.input.type === 'tel' || 
            property.input.type === 'url') && (
            <Input
              type={property.input.type}
              value={property.value}
              onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
              placeholder={property.input.placeholder}
            />
          )}
          {(property.input.type === 'number' || property.input.type === 'range') && (
            <Input
              type={property.input.type}
              value={property.value}
              onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
              min={property.input.min}
              max={property.input.max}
              step={property.input.step}
            />
          )}
          {(property.input.type === 'date' || 
            property.input.type === 'time' || 
            property.input.type === 'datetime-local') && (
            <Input
              type={property.input.type}
              value={property.value}
              onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
              min={property.input.min}
              max={property.input.max}
            />
          )}
          {property.input.type === 'checkbox' && (
            <Input
              type="checkbox"
              checked={property.value === 'true'}
              onChange={(e) => handlePropertyChange(propertyName, e.target.checked.toString())}
            />
          )}
          {property.input.type === 'radio' && property.input.options && (
            <VStack align="start" spacing={2}>
              {property.input.options.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    value={option}
                    checked={property.value === option}
                    onChange={(e) => handlePropertyChange(propertyName, e.target.value)}
                  />
                  {' '}{option}
                </label>
              ))}
            </VStack>
          )}
          {property.input.type === 'fileInput' && (
            <Input
              type="file"
              accept={property.input.accept}
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
    </Box>
  );
};
