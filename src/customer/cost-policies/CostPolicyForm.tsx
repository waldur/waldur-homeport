import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { InjectedFormProps } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  FieldError,
  NumberField,
  SelectField,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { translate } from '@waldur/i18n';
import {
  organizationAutocomplete,
  projectAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { ProjectCostField } from '@waldur/project/ProjectCostField';
import { getCustomer } from '@waldur/workspace/selectors';

import { CostPolicyFormData, CostPolicyType } from './types';
import { getCostPolicyActionOptions } from './utils';

interface CostPolicyFormProps
  extends Partial<InjectedFormProps<CostPolicyFormData>> {
  type: CostPolicyType;
  isEdit: boolean;
}

export const CostPolicyForm: FC<CostPolicyFormProps> = (props) => {
  const currentOrganization = useSelector(getCustomer);

  return (
    <FormContainer submitting={props.submitting} className="size-lg">
      {props.type === 'project' ? (
        <AsyncSelectField
          name="scope"
          label={translate('Select project(s)')}
          validate={required}
          required
          placeholder={translate('Search and select project') + '...'}
          loadOptions={(query, prevOptions, { page }) =>
            projectAutocomplete(
              currentOrganization?.uuid,
              query,
              prevOptions,
              page,
              { field: ['name', 'uuid', 'url', 'billing_price_estimate'] },
            )
          }
          isMulti
          isDisabled={props.isEdit}
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
          label={translate('Select organization(s)')}
          validate={required}
          required
          placeholder={translate('Search and select organization') + '...'}
          loadOptions={(query, prevOptions, { page }) =>
            organizationAutocomplete(query, prevOptions, page, {
              field: ['name', 'uuid', 'url'],
            })
          }
          isMulti
          isDisabled={props.isEdit}
          getOptionValue={(option) => option.url}
          getOptionLabel={(option) => option.name}
          noOptionsMessage={() => translate('No organizations')}
        />
      )}
      <NumberField
        label={translate('When estimated cost reaches')}
        name="limit_cost"
        placeholder={translate('Enter the cost threshold (e.g. 1000 EUR)')}
        validate={required}
        required={true}
        unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
      />
      <SelectField
        name="actions"
        label={translate('Then')}
        placeholder={
          translate('Select action to take when the condition is met') + '...'
        }
        validate={required}
        required
        options={getCostPolicyActionOptions(props.type)}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        spaceless
      />
      <Form.Group>
        <FieldError error={props.error} />
      </Form.Group>
    </FormContainer>
  );
};
