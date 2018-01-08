import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

import './IssueAttachmentLoading.scss';

export const IssueAttachmentLoading = () => {
  return (
    <div className="attachment-item-loading">
      <div className="attachment-item__overlay">
        <LoadingSpinner />
      </div>
    </div>
  );
};
