import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { PureVirtualMachineSummary, ResourceSummaryProps } from '@waldur/resource/summary';

const PureInstanceSummary = (props: ResourceSummaryProps) => {
  return <PureVirtualMachineSummary {...props}/>;
};

export const InstanceSummary = withTranslation(PureInstanceSummary);
