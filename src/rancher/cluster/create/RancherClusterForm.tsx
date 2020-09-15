import * as React from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { ENV } from '@waldur/core/services';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  SelectAsyncField,
  StringField,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { PlanField } from '@waldur/marketplace/details/plan/PlanField';
import { ProjectField } from '@waldur/marketplace/details/ProjectField';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';
import { loadSshKeysOptions } from '@waldur/openstack/api';
import { getUser } from '@waldur/workspace/selectors';

import { TenantGroup } from './TenantGroup';
import { TenantSelector } from './TenantSelector';
import { rancherClusterName } from './utils';

const getTenant = (state) =>
  formValueSelector(FORM_ID)(state, 'attributes.tenant_settings');

export const RancherClusterForm: React.FC<OfferingConfigurationFormProps> = (
  props,
) => {
  React.useEffect(() => {
    const { project, plan } = props;
    const initialData = {
      project,
      plan,
      attributes: { nodes: [], install_longhorn: true },
      limits: {
        node: 0,
      },
    };
    if (!plan && props.offering.plans.length === 1) {
      initialData.plan = props.offering.plans[0];
    }
    props.initialize(initialData);
  }, []);

  const tenant = useSelector(getTenant);

  const user = useSelector(getUser);

  const loadSshKeyOptions = React.useCallback(
    (query, prevOptions, currentPage) =>
      loadSshKeysOptions(user.uuid, query, prevOptions, currentPage),
    [user.uuid],
  );

  return (
    <form className="form-horizontal">
      <FormContainer
        submitting={props.submitting}
        labelClass="col-sm-3"
        controlClass="col-sm-9"
      >
        <ProjectField />
        <StringField
          label={translate('Cluster name')}
          name="attributes.name"
          description={translate(
            'This name will be visible in accounting data.',
          )}
          validate={[required, rancherClusterName]}
          required={true}
        />
        <PlanField offering={props.offering} />
        <PlanDetailsTable
          offering={props.offering}
          limits={props.limits}
          viewMode={true}
        />
        <TextField
          label={translate('Cluster description')}
          name="attributes.description"
        />
        {!ENV.plugins.WALDUR_RANCHER.DISABLE_SSH_KEY_INJECTION && (
          <SelectAsyncField
            name="attributes.ssh_public_key"
            label={translate('SSH public key')}
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.name}
            defaultOptions
            loadOptions={(query, prevOptions, { page }) =>
              loadSshKeyOptions(query, prevOptions, page)
            }
            isClearable={true}
            additional={{
              page: 1,
            }}
          />
        )}
        <AwesomeCheckboxField
          name="attributes.install_longhorn"
          label={translate(
            'Deploy Longhorn block storage after cluster is deployed',
          )}
          hideLabel={true}
          description={
            <ExternalLink
              label={translate(
                'Longhorn is a lightweight, reliable, and powerful distributed block storage system for Kubernetes.',
              )}
              url="https://longhorn.io/docs/"
            />
          }
        />
        {props.project && <TenantSelector project={props.project} />}
        {tenant && <TenantGroup tenant={tenant} offering={props.offering} />}
      </FormContainer>
    </form>
  );
};
