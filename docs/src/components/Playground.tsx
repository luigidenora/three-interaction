// src/components/Playground.tsx
import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useColorMode } from '@docusaurus/theme-common';
import { CodePreview } from 'docusaurus-plugin-code-preview';

export default function Playground(props: any) {
  const { colorMode } = useColorMode();
  return (
    <CodePreview
      devicePreview={true}
      src={useBaseUrl(props.src)}
      output={{ outputs: [{ name: 'TypeScript', value: 'typescript' }], defaultOutput: 'typescript' }}
      viewport={{
        viewports: [
          { 
            name: 'MD',
            src: baseUrl => `${baseUrl}?ionic:mode=md`,
          },
        ],
        // This is the default selected option and rendered iframe example
        defaultViewport: 'MD',
      }}
      controls={{
        resetDemo: true, // you can optional pass an object to configure the tooltip
      }}
      isDarkMode={colorMode === "dark"}
      {...props}
    />
  );
}
