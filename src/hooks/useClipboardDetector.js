import { useState, useEffect, useRef } from 'react';

export function useClipboardDetector(onDetect) {
  const [detectedType, setDetectedType] = useState(null);
  const [detectedContent, setDetectedContent] = useState('');
  const lastClipboardRef = useRef('');

  useEffect(() => {
    // Check clipboard every 2 seconds
    const interval = setInterval(async () => {
      try {
        let text = '';
        if (window.electronAPI) {
          text = await window.electronAPI.readClipboard();
        } else {
          // Fallback if running in pure browser for testing
          text = await navigator.clipboard.readText();
        }

        if (!text || text.trim() === '' || text === lastClipboardRef.current) {
          return;
        }

        const trimmedText = text.trim();

        // 1. Detect JWT
        if (/^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(trimmedText)) {
          setDetectedType('JWT');
          setDetectedContent(trimmedText);
          onDetect?.('JWT', trimmedText);
          lastClipboardRef.current = text;
          return;
        }

        // 2. Detect JSON
        if ((trimmedText.startsWith('{') && trimmedText.endsWith('}')) || 
            (trimmedText.startsWith('[') && trimmedText.endsWith(']'))) {
          try {
            JSON.parse(trimmedText);
            setDetectedType('JSON');
            setDetectedContent(trimmedText);
            onDetect?.('JSON', trimmedText);
            lastClipboardRef.current = text;
            return;
          } catch (e) {
            // Not valid JSON, ignore
          }
        }

        // 3. Detect URL
        if (/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(trimmedText)) {
          setDetectedType('URL');
          setDetectedContent(trimmedText);
          onDetect?.('URL', trimmedText);
          lastClipboardRef.current = text;
          return;
        }

        // 4. Detect Base64
        // Check if it looks like Base64 (length divisible by 4, proper characters) and is not a simple short word
        if (trimmedText.length > 8 && /^[A-Za-z0-9+/]+={0,2}$/.test(trimmedText)) {
          setDetectedType('Base64');
          setDetectedContent(trimmedText);
          onDetect?.('Base64', trimmedText);
          lastClipboardRef.current = text;
          return;
        }

      } catch (err) {
        // Clipboard read permission might be denied in browser, ignore
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [onDetect]);

  const resetDetection = () => {
    setDetectedType(null);
    setDetectedContent('');
  };

  const ignoreCurrent = () => {
    // Save current content so we don't alert again for this exact text
    lastClipboardRef.current = detectedContent;
    resetDetection();
  };

  return { detectedType, detectedContent, resetDetection, ignoreCurrent };
}
