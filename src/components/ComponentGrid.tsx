import { AddIcon, CopyIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, Grid, GridItem, Text, VStack, useColorModeValue, IconButton, HStack, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ComponentData {
  id: string;
  name: string;
  config: string;
  html: string;
  css: string;
  javascript: string;
  lastModified: string;
}

interface ComponentGridProps {
  savedComponents: ComponentData[];
  onUpdate: (components: ComponentData[]) => void;
}

export const ComponentGrid = ({ savedComponents, onUpdate }: ComponentGridProps) => {
  const navigate = useNavigate();
  const tileBg = useColorModeValue('white', 'gray.700');
  const tileHoverBg = useColorModeValue('gray.50', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCreateNew = () => {
    navigate('/editor/new');
  };

  const toast = useToast();

  const handleOpenComponent = (id: string) => {
    navigate(`/editor/${id}`);
  };

  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
      }}
      gap={6}
      width="100%"
      px={4}
    >
      {/* Create New Component Tile */}
      <GridItem>
        <Box
          position="relative"
          height="0"
          paddingBottom="100%"
          width="100%"
          borderRadius="lg"
          border="2px dashed"
          borderColor={borderColor}
          bg={tileBg}
          transition="all 0.2s"
          _hover={{
            bg: tileHoverBg,
            transform: 'scale(1.02)',
          }}
        >
          <Box
            as="button"
            onClick={handleCreateNew}
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            width="100%"
            height="100%"
          >
            <VStack
              justify="center"
              align="center"
              spacing={3}
              p={4}
              height="100%"
            >
              <AddIcon boxSize={8} color="blue.500" />
              <Text fontSize="lg" fontWeight="medium" textAlign="center">
                Create New Component
              </Text>
            </VStack>
          </Box>
        </Box>
      </GridItem>

      {/* Saved Components Tiles */}
      {savedComponents.map((component) => (
        <GridItem key={component.id}>
          <Box
            position="relative"
            height="0"
            paddingBottom="100%"
            width="100%"
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            bg={tileBg}
            transition="all 0.2s"
            _hover={{
              bg: tileHoverBg,
              '& .action-buttons': { opacity: 1 }
            }}
          >
            <Box
              as="button"
              onClick={() => handleOpenComponent(component.id)}
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              width="100%"
              height="100%"
            >
              <VStack
                justify="center"
                align="center"
                spacing={2}
                p={4}
                height="100%"
              >
                <Text fontSize="lg" fontWeight="medium" noOfLines={2}>
                  {component.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Last modified: {new Date(component.lastModified).toLocaleDateString()}
                </Text>
              </VStack>
            </Box>
            
            {/* Action Buttons */}
            <HStack
              className="action-buttons"
              position="absolute"
              top={2}
              right={2}
              spacing={2}
              opacity={0}
              transition="opacity 0.2s"
              zIndex={1}
            >
              <IconButton
                aria-label="Duplicate component"
                icon={<CopyIcon />}
                size="sm"
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  const components = JSON.parse(localStorage.getItem('components') || '[]');
                  const newComponent = {
                    ...component,
                    id: Date.now().toString(),
                    name: `Copy of ${component.name}`,
                    lastModified: new Date().toISOString()
                  };
                  components.push(newComponent);
                  localStorage.setItem('components', JSON.stringify(components));
                  onUpdate(components);
                  toast({
                    title: 'Component duplicated',
                    description: `Created copy of ${component.name}`,
                    status: 'success',
                    duration: 3000,
                  });
                }}
              />
              <IconButton
                aria-label="Delete component"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="solid"
                onClick={(e) => {
                  e.stopPropagation();
                  const components = JSON.parse(localStorage.getItem('components') || '[]');
                  const filteredComponents = components.filter((c: any) => c.id !== component.id);
                  localStorage.setItem('components', JSON.stringify(filteredComponents));
                  onUpdate(filteredComponents);
                  toast({
                    title: 'Component deleted',
                    description: `${component.name} has been removed`,
                    status: 'success',
                    duration: 3000,
                  });
                }}
              />
            </HStack>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};
