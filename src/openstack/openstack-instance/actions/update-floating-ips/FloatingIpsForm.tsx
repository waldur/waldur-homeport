import { FieldArray } from 'redux-form';

import { translate } from '@waldur/i18n';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';

import { FloatingIpsList } from './FloatingIpsList';
import { connectForm } from './utils';

export const FloatingIpsForm = connectForm(
  ({
    handleSubmit,
    submitting,
    invalid,
    submitRequest,
    asyncState,
    resource,
    subnets,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <AsyncActionDialog
        title={translate('Update floating IPs in {name} virtual machine', {
          name: resource.name,
        })}
        loading={asyncState.loading}
        error={asyncState.error}
        submitting={submitting}
        invalid={invalid}
      >
        {asyncState.value ? (
          <FieldArray
            name="floating_ips"
            component={FloatingIpsList}
            floatingIps={asyncState.value}
            subnets={subnets}
          />
        ) : null}
      </AsyncActionDialog>
    </form>
  ),
);
