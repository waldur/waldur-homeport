import { Form, InputGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import {
  SelectField,
  FormContainer,
  FieldError,
  SubmitButton,
  NumberField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import { projectAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { ProjectCostField } from '@waldur/project/ProjectCostField';
import { getCustomer } from '@waldur/workspace/selectors';

import { CostPolicyFormData } from './types';
import { getCostPolicyActionOptions } from './utils';

export const CostPolicyCreateForm = reduxForm<
  CostPolicyFormData,
  { onSubmit; onCancel }
>({
  form: 'costPolicyCreate',
})((props) => {
  const currentOrganization = useSelector(getCustomer);

  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <FormContainer submitting={props.submitting}>
        <AsyncSelectField
          name="project"
          label={
            <>
              1. {translate('Select project')}
              <span className="text-danger"> *</span>
            </>
          }
          validate={required}
          placeholder={translate('Select project...')}
          loadOptions={(query, prevOptions, { page }) =>
            projectAutocomplete(
              currentOrganization?.uuid,
              query,
              prevOptions,
              page,
              { field: ['name', 'uuid', 'url', 'billing_price_estimate'] },
            )
          }
          getOptionValue={(option) => option.url}
          getOptionLabel={(option) =>
            `${option.name} / est. ${ProjectCostField({ row: option })} ` +
            translate('this month')
          }
          noOptionsMessage={() => translate('No projects')}
        />
        <Form.Group className="mb-7">
          <Form.Label>
            2. {translate('When')}
            <span className="text-danger"> *</span>
          </Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              {translate('Estimated cost reaches')}
            </InputGroup.Text>
            <Field
              name="limit_cost"
              component={NumberField}
              placeholder="0"
              validate={required}
            />
            <InputGroup.Text>
              {ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>
        <SelectField
          name="actions"
          label={
            <>
              3. {translate('Then')}
              <span className="text-danger"> *</span>
            </>
          }
          options={getCostPolicyActionOptions()}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          validate={required}
        />
        <Form.Group className="text-end">
          <FieldError error={props.error} />
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Create')}
          />
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={props.onCancel}
          >
            {translate('Cancel')}
          </button>
        </Form.Group>
      </FormContainer>
    </form>
  );
});
