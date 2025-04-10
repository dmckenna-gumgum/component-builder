import { Box, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

interface ComponentPreviewProps {
  html: string;
  css: string;
  javascript: string;
  componentName?: string;
}

// Suppress ResizeObserver loop limit exceeded error
const suppressResizeObserverLoopError = () => {
  const resizeObserverLoopErrRe = /^ResizeObserver loop limit exceeded/;
  const error = Error.prototype.toString;
  Error.prototype.toString = function(...args) {
    if (resizeObserverLoopErrRe.test(this.message)) {
      return ''; // Return empty string for this specific error
    }
    return error.apply(this, args);
  };
};

// Call it once when the module loads
suppressResizeObserverLoopError();

export const ComponentPreview = ({ html, css, javascript, componentName = 'New Component' }: ComponentPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'error') {
        const { message, line, col } = event.data;
        setError(`${message}${line ? ` (line ${line}${col ? `, col ${col}` : ''})` : ''}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const updateIframe = useCallback(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body, html {
              height: 100%;
              width: 100%;
            }
            body { margin: 0; padding: 0;}
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onerror = function(msg, url, line, col, error) {
              window.parent.postMessage({ type: 'error', message: msg, line, col }, '*');
              return false;
            };
            console.error = function(...args) {
              window.parent.postMessage({ type: 'error', message: args.join(' ') }, '*');
            };
            window.componentName = ${JSON.stringify(componentName)};
            window.componentConfig = {};
            try {
              // First try to extract and parse any config assignment
              const js = ${JSON.stringify(javascript)};
              const configStart = js.indexOf('window.componentConfig =');
              if (configStart >= 0) {
                let configEnd = js.indexOf(';', configStart);
                if (configEnd >= 0) {
                  const configStr = js.substring(configStart + 23, configEnd).trim();
                  try {
                    const parsed = JSON.parse(configStr);
                    if (parsed && typeof parsed === 'object') {
                      window.componentConfig = parsed;
                    }
                  } catch (e) {
                    console.warn('Config parse error:', e);
                    // Keep existing componentConfig
                  }
                }
              }
              // Run the JavaScript code
              ${javascript}
            } catch (error) {
              window.parent.postMessage({ type: 'error', message: error.message }, '*');
            }
          </script>
        </body>
      </html>
    `);
    doc.close();
  }, [html, css, javascript, componentName]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    // Create new observer
    resizeObserverRef.current = new ResizeObserver(() => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        updateIframe();
      }, 100);
    });

    // Start observing
    resizeObserverRef.current.observe(containerRef.current);

    // Initial update
    updateIframe();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateIframe]);

  return (
    <VStack height="100%" width="100%" borderWidth="1px" borderRadius="md" spacing={2} overflow="hidden">
      <Box position="relative" flex={1} width="100%" ref={containerRef} overflow="hidden">
        <iframe
          ref={iframeRef}
          title="Component Preview"
          style={{
            border: 'none',
            display: 'block',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </Box>
      {error && (
        <Box 
          width="100%" 
          p={2} 
          bg="red.50" 
          color="red.600" 
          borderTop="1px" 
          borderColor="red.200"
          fontSize="sm"
          fontFamily="mono"
        >
          <Text>Error: {error}</Text>
        </Box>
      )}
    </VStack>
  );
};
