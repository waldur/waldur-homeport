import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { Field, FormRenderProps } from 'react-final-form';

import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { policyPeriodOptions } from '@waldur/customer/cost-policies/utils';
import { NumberField, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useOrganizationGroups } from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Offering } from '@waldur/marketplace/types';

import { getOfferingPolicyActionOptions } from '../utils';

import { ComponentLimitsField } from './ComponentLimitsField';
import {
  OfferingCostPolicyFormData,
  OfferingUsagePolicyFormData,
  OfferingPolicyType,
} from './types';

interface PolicyCreateFormProps extends Partial<
  FormRenderProps<OfferingCostPolicyFormData | OfferingUsagePolicyFormData>
> {
  type: OfferingPolicyType;
  offering?: Offering;
}

export const PolicyCreateForm: FC<PolicyCreateFormProps> = (props) => {
  const {
    isLoading: groupsLoading,
    error: groupsError,
    data: organizationGroups,
    refetch: refetchGroups,
  } = useOrganizationGroups();

  return (
    <div className="size-lg">
      {props.type === 'usage' ? (
        <ComponentLimitsField components={props.offering.components} />
      ) : (
        <FormGroup label={translate('When estimated cost reaches')} required>
          <Field
            component={NumberField as any}
            name="limit_cost"
            placeholder={translate('Enter the cost threshold (e.g. 1000 EUR)')}
            unit={ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
            validate={required}
          />
        </FormGroup>
      )}

      <FormGroup label={translate('Then')} required>
        <Field
          component={SelectField as any}
          name="actions"
          placeholder={translate(
            'Select action to take when the condition is met...',
          )}
          options={getOfferingPolicyActionOptions()}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          simpleValue
          validate={required}
        />
      </FormGroup>

      <FormGroup label={translate('Period')} required>
        <Field
          component={SelectField as any}
          name="period"
          placeholder={translate('Select period')}
          options={Object.values(policyPeriodOptions)}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          simpleValue
          validate={required}
        />
      </FormGroup>

      {groupsLoading ? (
        <LoadingSpinner />
      ) : groupsError ? (
        <LoadingErred
          loadData={refetchGroups}
          message={translate('Unable to load organization groups.')}
        />
      ) : (
        <FormGroup label={translate('Organization groups')} required>
          <Field
            component={SelectField as any}
            name="organization_groups"
            placeholder={translate('Select organization groups')}
            options={organizationGroups}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.value}
            simpleValue
            isMulti
            spaceless
            validate={required}
          />
        </FormGroup>
      )}

      {props.submitError && (
        <Form.Group>
          <div className="text-danger">{props.submitError}</div>
        </Form.Group>
      )}
    </div>
  );
};
