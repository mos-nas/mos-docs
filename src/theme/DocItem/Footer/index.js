import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import CopyMarkdownButton from '@site/src/components/CopyMarkdownButton';

export default function DocItemFooterWrapper(props) {
  return (
    <>
      <CopyMarkdownButton />
      <Footer {...props} />
    </>
  );
}
