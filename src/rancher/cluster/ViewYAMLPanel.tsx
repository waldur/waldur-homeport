import * as React from 'react';

import { CopyToClipboard } from '@waldur/core/CopyToClipboard';
import { MonacoField } from '@waldur/marketplace-script/MonacoField';

export const ViewYAMLPanel = ({ yaml }) => {
  return (
    <>
      <MonacoField input={{ value: yaml }} mode="yaml" />

      <CopyToClipboard value={yaml} />
    </>
  );
};
