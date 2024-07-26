import { Form, InputGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  FieldError,
  SubmitButton,
  NumberField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import {
  organizationAutocomplete,
  projectAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { ProjectCostField } from '@waldur/project/ProjectCostField';
import { getCustomer } from '@waldur/workspace/selectors';

import { CostPolicyFormData, CostPolicyType } from './types';
import { getCostPolicyActionOptions } from './utils';

export const CostPolicyCreateForm = reduxForm<
  CostPolicyFormData,
  { onSubmit; onCancel; type: CostPolicyType }
>({
  form: 'costPolicyCreate',
})((props) => {
  const currentOrganization = useSelector(getCustomer);

  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <FormContainer submitting={props.submitting}>
        {props.type === 'project' ? (
          <AsyncSelectField
            name="scope"
            label={
              <>
                1. {translate('Select project')}
                <span className="text-danger"> *</span>
              </>
            }
            validate={required}
            placeholder={translate('Select project') + '...'}
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
        ) : (
          <AsyncSelectField
            name="scope"
            label={
              <>
                1. {translate('Select organization')}
                <span className="text-danger"> *</span>
              </>
            }
            validate={required}
            placeholder={translate('Select organization') + '...'}
            loadOptions={(query, prevOptions, { page }) =>
              organizationAutocomplete(query, prevOptions, page, {
                field: ['name', 'uuid', 'url'],
              })
            }
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.name}
            noOptionsMessage={() => translate('No organizations')}
          />
        )}
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
        <Form.Group className="mb-7">
          <Form.Label>3. {translate('Then')}</Form.Label>
          <span className="text-danger"> *</span>
          <Field
            name="actions"
            validate={required}
            component={(fieldProps) => (
              <Select
                value={fieldProps.input.value}
                onChange={(value) => fieldProps.input.onChange(value)}
                options={getCostPolicyActionOptions(props.type)}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
              />
            )}
          />
        </Form.Group>
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
