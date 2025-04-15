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
    console.log("update iframe callback");
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
            // Wait for the document to be ready before setting up error handlers
            document.addEventListener('DOMContentLoaded', function() {
              // Keep track of initialization state
              let isInitialized = false;

              // Set up error handlers
              window.onerror = function(msg, url, line, col, error) {
                // Only report errors after initialization
                if (isInitialized) {
                  window.parent.postMessage({ type: 'error', message: msg, line, col }, '*');
                }
                return false;
              };
              
              console.error = function(...args) {
                // Only report errors after initialization
                if (isInitialized) {
                  window.parent.postMessage({ type: 'error', message: args.join(' ') }, '*');
                }
              };

              // Set up initial state
              window.componentName = ${JSON.stringify(componentName)};
              window.componentConfig = {};

              try {
                // Run the JavaScript code
                ${javascript}
                
                // Validate the config
                if (!window.componentConfig || typeof window.componentConfig !== 'object') {
                  throw new Error('Invalid componentConfig: must be a valid object');
                }

                // Mark as initialized only after successful setup
                isInitialized = true;
              } catch (error) {
                window.parent.postMessage({ 
                  type: 'error', 
                  message: 'Component initialization error: ' + error.message 
                }, '*');
                // Reset config to empty object on error
                window.componentConfig = {};
              }
            });
            
          </script>
        </body>
      </html>
    `);
    doc.close();
  }, [html, css, javascript, componentName]);

  const clearIframe = useCallback(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    // Clear the iframe content
    doc.open();
    doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
    doc.close();

    // Set to blank to ensure scripts are stopped
    iframeRef.current.src = 'about:blank';
  }, []);

  // Update when props change
  useEffect(() => {
    console.log("props changed, updating iframe");
    updateIframe();
    return () => {
      clearIframe();
    };
  }, [html, css, javascript, componentName, updateIframe, clearIframe]);

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
        console.log("update iframe after timeout");
        updateIframe();
      }, 100);
    });

    // Start observing
    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      // Clean up observer and timeouts
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
