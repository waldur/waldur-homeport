import * as React from 'react';

import { withTranslation } from '@waldur/i18n';
import { Field, ResourceSummaryProps, PureVirtualMachineSummary } from '@waldur/resource/summary';
import { UserPassword } from '@waldur/resource/UserPassword';
import { connectAngularComponent } from '@waldur/store/connect';

const formatEndpoints = props =>
  props.resource.endpoints.map((endpoint, index) => (
    <Field
      key={index}
      label={endpoint.name === 'SSH' ? props.translate('SSH port') : endpoint.name}
      value={endpoint.name === 'SSH' ? endpoint.public_port : (
        <a href={props.resource.rdp}>
          {props.resource.name}.rdp
        </a>
      )}
    />
  ));

const PureAzureVirtualMachineSummary = (props: ResourceSummaryProps) => {
  const { translate, resource } = props;
  return (
    <span>
      <PureVirtualMachineSummary {...props}/>
      {formatEndpoints(props)}
      <Field
        label={translate('Username')}
        value={resource.user_username}
      />
      <Field
        label={translate('Password')}
        value={<UserPassword {...props}/>}
      />
    </span>
  );
};

export const AzureVirtualMachineSummary = withTranslation(PureAzureVirtualMachineSummary);

export default connectAngularComponent(AzureVirtualMachineSummary, ['resource']);
