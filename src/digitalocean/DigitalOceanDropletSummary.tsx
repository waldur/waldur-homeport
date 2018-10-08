import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureVirtualMachineSummary } from '@waldur/resource/summary';

const PureDigitalOceanDropletSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureVirtualMachineSummary {...props}/>
      <Field
        label={translate('Region')}
        value={resource.region_name}
      />
    </span>
  );
};

export const DigitalOceanDropletSummary = withTranslation(PureDigitalOceanDropletSummary);
