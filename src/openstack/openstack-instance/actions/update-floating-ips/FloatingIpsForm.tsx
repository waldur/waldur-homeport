import { FieldArray } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { FloatingIpsList } from './FloatingIpsList';
import { connectForm } from './utils';

export const FloatingIpsForm = connectForm(
  ({
    handleSubmit,
    submitting,
    invalid,
    submitRequest,
    asyncState,
    resourceName,
    subnets,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Update floating IPs in {name} virtual machine', {
          name: resourceName,
        })}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={submitting}
              disabled={asyncState.loading || invalid}
              label={translate('Submit')}
            />
          </>
        }
      >
        {asyncState.loading ? (
          <LoadingSpinner />
        ) : asyncState.error ? (
          <>{translate('Unable to load data.')}</>
        ) : (
          <FieldArray
            name="floating_ips"
            component={FloatingIpsList}
            floatingIps={asyncState.value}
            subnets={subnets}
          />
        )}
      </ModalDialog>
    </form>
  ),
);
