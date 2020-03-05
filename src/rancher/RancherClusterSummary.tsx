import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import {
  Field,
  ResourceSummaryProps,
  PureResourceSummaryBase,
} from '@waldur/resource/summary';
import { ResourceAccessInfo } from '@waldur/resource/summary/ResourceAccessInfo';

const PureRancherClusterSummary = (props: ResourceSummaryProps) => {
  const { translate } = props;
  return (
    <>
      <PureResourceSummaryBase {...props} />
      <Field
        label={translate('Access')}
        value={<ResourceAccessInfo {...props} />}
      />
    </>
  );
};

export const RancherClusterSummary = withTranslation(PureRancherClusterSummary);
