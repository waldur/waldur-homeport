import { FC } from 'react';
import { useFormState } from 'react-final-form';
import {
  BillingTypeEnum,
  OfferingComponent,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { BooleanGroup, NumberGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { getPrepaidDescription } from '@/marketplace/common/billingTypes';

import { ComponentAccountingTypeWrapper } from './ComponentAccountingTypeWrapper';
import { ComponentMaxValueField } from './ComponentMaxValueField';
import { ComponentMinValueField } from './ComponentMinValueField';

interface Values {
  billing_type?: {
    value: BillingTypeEnum;
  };
  is_prepaid?: boolean;
}

export const ComponentPrepaidFieldGroup: FC<{
  offering: ProviderOfferingDetails;
}> = (props) => {
  const { values } = useFormState<Values>({ subscription: { values: true } });
  const billingType = values.billing_type?.value;
  const isPrepaid = values.is_prepaid;

  return billingType == 'one' ? (
    <ComponentAccountingTypeWrapper>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <ComponentMinValueField />
        </div>
        <div>
          <ComponentMaxValueField />
        </div>
      </div>
      <BooleanGroup
        name="is_prepaid"
        label={translate('Pre-paid component')}
        description={getPrepaidDescription()}
        space={4}
      />
      {isPrepaid ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 items-end">
            <div>
              <NumberGroup
                name="min_prepaid_duration"
                label={translate('Min duration')}
                spaceless
              />
            </div>
            <div>
              <NumberGroup
                name="max_prepaid_duration"
                label={translate('Max duration')}
                spaceless
              />
            </div>
            <div>
              <NumberGroup
                name="prepaid_duration_step"
                label={translate('Duration step')}
                spaceless
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 items-end">
            <div>
              <NumberGroup
                name="min_renewal_duration"
                label={translate('Min renewal duration')}
                spaceless
              />
            </div>
            <div>
              <NumberGroup
                name="max_renewal_duration"
                label={translate('Max renewal duration')}
                spaceless
              />
            </div>
            <div>
              <NumberGroup
                name="renewal_duration_step"
                label={translate('Renewal duration step')}
                spaceless
              />
            </div>
          </div>
          <SelectGroup
            name="overage_component"
            options={props.offering.components.filter(
              (component) => component.billing_type == 'usage',
            )}
            getOptionValue={(option: OfferingComponent) => option.uuid}
            getOptionLabel={(option: OfferingComponent) => option.name}
            simpleValue
            label={translate('Overage component')}
            spaceless
          />
        </>
      ) : null}
    </ComponentAccountingTypeWrapper>
  ) : null;
};
