import React from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import NotFoundContent from '@theme/NotFound/Content';

export default function NotFound() {
  return (
    <>
      <PageMetadata title="Page Not Found" />
      <Layout>
        <NotFoundContent />
      </Layout>
    </>
  );
}
