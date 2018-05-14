import * as React from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { Field, PureResourceSummaryBase } from '@waldur/resource/summary';
import { Volume } from '@waldur/resource/types';

interface ResourceSummaryProps extends TranslateProps {
  resource: Volume;
}

const PureVolumeSummary = (props: ResourceSummaryProps) => {
  const { translate } = props;
  return (
    <>
      <PureResourceSummaryBase {...props}/>
      <Field
        label={translate('Size')}
        value={formatFilesize(props.resource.size)}
      />
    </>
  );
};

export const VolumeSummary = withTranslation(PureVolumeSummary);
