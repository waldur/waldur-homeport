import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureVirtualMachineSummary } from '@waldur/resource/summary';

const SecurityGroupsLink = props => (
  <span>{JSON.stringify(props.items)}</span>
);

const PureOpenStackInstanceSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureVirtualMachineSummary {...props}/>
      <Field
        label={translate('Security groups')}
        value={resource.security_groups && <SecurityGroupsLink items={resource.security_groups}/>}
      />
    </span>
  );
};

export const OpenStackInstanceSummary = withTranslation(PureOpenStackInstanceSummary);
