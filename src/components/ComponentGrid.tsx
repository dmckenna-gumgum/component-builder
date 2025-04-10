import { AddIcon } from '@chakra-ui/icons';
import { Box, Grid, GridItem, Text, VStack, useColorModeValue } from '@chakra-ui/react';
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
}

export const ComponentGrid = ({ savedComponents }: ComponentGridProps) => {
  const navigate = useNavigate();
  const tileBg = useColorModeValue('white', 'gray.700');
  const tileHoverBg = useColorModeValue('gray.50', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCreateNew = () => {
    navigate('/editor/new');
  };

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
          as="button"
          onClick={handleCreateNew}
          height="0"
          paddingBottom="100%"
          position="relative"
          width="100%"
          borderRadius="lg"
          border="2px dashed"
          borderColor={borderColor}
          bg={tileBg}
          _hover={{
            bg: tileHoverBg,
            transform: 'scale(1.02)',
          }}
          transition="all 0.2s"
        >
          <VStack
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            justify="center"
            align="center"
            spacing={3}
          >
            <AddIcon boxSize={8} color="blue.500" />
            <Text fontSize="lg" fontWeight="medium">
              Create New Component
            </Text>
          </VStack>
        </Box>
      </GridItem>

      {/* Saved Components Tiles */}
      {savedComponents.map((component) => (
        <GridItem key={component.id}>
          <Box
            as="button"
            onClick={() => handleOpenComponent(component.id)}
            height="0"
            paddingBottom="100%"
            position="relative"
            width="100%"
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            bg={tileBg}
            _hover={{
              bg: tileHoverBg,
              transform: 'scale(1.02)',
            }}
            transition="all 0.2s"
          >
            <VStack
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              justify="center"
              align="center"
              spacing={2}
              p={4}
            >
              <Text fontSize="lg" fontWeight="medium" noOfLines={2}>
                {component.name}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Last modified: {new Date(component.lastModified).toLocaleDateString()}
              </Text>
            </VStack>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};
