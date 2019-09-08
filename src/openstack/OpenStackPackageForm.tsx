import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { getLatinNameValidators } from '@waldur/core/validators';
import {
  FormContainer,
  StringField,
  TextField,
  SecretField,
} from '@waldur/form-react';
import { AwesomeCheckboxField } from '@waldur/form-react/AwesomeCheckboxField';
import { LabelField } from '@waldur/form-react/LabelField';
import { translate } from '@waldur/i18n';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { OpenStackAllocationPool } from './OpenStackAllocationPool';
import { OpenStackSubnetField } from './OpenStackSubnetField';
import { extractSubnet } from './utils';

export const DEFAULT_SUBNET_CIDR = '192.168.X.0/24';

export class OpenStackPackageForm extends React.Component<OfferingConfigurationFormProps> {
  componentDidMount() {
    const { project, plan } = this.props;
    this.props.initialize({
      attributes: {
        subnet_cidr: '42',
        ...this.props.initialAttributes,
      },
      limits: this.props.initialLimits,
      project,
      plan,
    });
  }

  render() {
    const props = this.props;
    return (
      <form className="form-horizontal">
        <FormContainer
          submitting={props.submitting}
          labelClass="col-sm-3"
          controlClass="col-sm-9">
          <ProjectField/>
          <StringField
            label={translate('Tenant name')}
            name="attributes.name"
            description={translate('This name will be visible in accounting data.')}
            validate={getLatinNameValidators()}
            required={true}
          />
          <PlanField offering={props.offering}/>
          <PlanDetailsTable offering={props.offering} limits={props.limits}/>
          <TextField
            label={translate('Tenant description')}
            name="attributes.description"
          />
          {ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE && (
            <LabelField label={translate('Access')}/>
          )}
          {ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE && (
            <StringField
              label={translate('Initial admin username')}
              placeholder={translate('generate automatically')}
              tooltip={translate('Leave blank if you want admin username to be auto-generated.')}
              name="attributes.user_username"
            />
          )}
          {ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE && (
            <SecretField
              label={translate('Initial admin password')}
              placeholder={translate('generate automatically')}
              tooltip={translate('Leave blank if you want admin password to be auto-generated.')}
              name="attributes.user_password"
            />
          )}
          <OpenStackSubnetField
            label={translate('Internal network mask (CIDR)')}
            name="attributes.subnet_cidr"
            mask={DEFAULT_SUBNET_CIDR}
            format={v => isNaN(v) ? extractSubnet(v) : v}
          />
          <OpenStackAllocationPool
            label={translate('Internal network allocation pool')}
            name="attributes.subnet_allocation_pool"
            range="192.168.X.10 — 192.168.X.200"
          />
          {ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES && (
            <AwesomeCheckboxField
              hideLabel={true}
              label={translate('Skip connection to external network')}
              name="attributes.skip_connection_extnet"
            />
          )}
        </FormContainer>
      </form>
    );
  }
}
