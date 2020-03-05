import * as React from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { withTranslation } from '@waldur/i18n';
import { Field, PureResourceSummaryBase } from '@waldur/resource/summary';

const PureVMwareDiskSummary = props => {
  const { translate, resource } = props;
  return (
    <>
      <PureResourceSummaryBase {...props} />
      <Field label={translate('Size')} value={formatFilesize(resource.size)} />
    </>
  );
};

export const VMwareDiskSummary = withTranslation(PureVMwareDiskSummary);
