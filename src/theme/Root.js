import React from 'react';
import PwaPrompt from '@site/src/components/PwaPrompt';

export default function Root({children}) {
  return (
    <>
      {children}
      <PwaPrompt />
    </>
  );
}
