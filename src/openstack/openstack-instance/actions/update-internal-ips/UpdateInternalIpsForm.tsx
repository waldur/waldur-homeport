import { ControlLabel, FormGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { AsyncActionDialog } from '@waldur/resource/actions/AsyncActionDialog';

import { connectForm } from './utils';

export const UpdateInternalIpsForm = connectForm(
  ({
    handleSubmit,
    submitting,
    invalid,
    submitRequest,
    asyncState,
    resource,
  }) => (
    <form onSubmit={handleSubmit(submitRequest)}>
      <AsyncActionDialog
        title={translate('Update internal IPs for OpenStack instance {name}', {
          name: resource.name,
        })}
        loading={asyncState.loading}
        error={asyncState.error}
        submitting={submitting}
        invalid={invalid}
      >
        {asyncState.value ? (
          <FormGroup>
            <ControlLabel>{translate('Connected subnets')}</ControlLabel>
            <Field
              component={SelectField}
              name="internal_ips_set"
              placeholder={translate('Select subnets to connect to...')}
              options={asyncState.value}
              isMulti={true}
            />
          </FormGroup>
        ) : null}
      </AsyncActionDialog>
    </form>
  ),
);
