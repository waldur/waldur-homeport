import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import { useForm, useFormState } from 'react-final-form';
import {
  proposalProtectedCallsOfferingsList,
  RequestedOffering,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { FormContainer, SelectField, StringField } from '@/form';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';

const getOfferings = (call_uuid: string) =>
  getAllPages<RequestedOffering>((page) =>
    proposalProtectedCallsOfferingsList({
      query: { page, page_size: MAX_PAGE_SIZE, state: 'accepted' },
      path: { uuid: call_uuid },
    }),
  );

export const Step1General: FC<WizardFormStepProps> = (props) => {
  const offeringsQuery = useQuery({
    queryKey: ['proposalRequestedOfferings', props.data.call?.uuid],
    queryFn: () => getOfferings(props.data.call?.uuid),
    staleTime: STALE_TIME,
  });

  const offeringOptions = useMemo(
    () =>
      (offeringsQuery?.data || []).map((item) => ({
        uuid: item.uuid,
        offering_name: item.offering_name,
        plan_details: item.plan_details,
      })),
    [offeringsQuery],
  );

  const { values, submitting } = useFormState({
    subscription: { values: true, submitting: true },
  });
  const form = useForm();

  const { offering } = values;

  useEffect(() => {
    if (!offering) return;
    const fullOffering = (offeringsQuery?.data || []).find(
      (item) => item.uuid === offering.uuid,
    );
    if (fullOffering) {
      form.change('offering', fullOffering);
      form.change('plan', fullOffering.plan_details);
    } else {
      form.change('offering', null);
    }
  }, [offeringsQuery?.data, offering]);
  return (
    <WizardForm {...props}>
      <FormContainer submitting={submitting} className="size-lg">
        <StringField
          name="name"
          label={translate('Template name')}
          placeholder={translate('e.g., Standard Compute Package')}
          required
          validate={required}
        />
        <SelectField
          name="offering"
          label={translate('Offering')}
          options={offeringOptions}
          isLoading={offeringsQuery.isLoading}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.offering_name}
          required
          validate={required}
          onChange={(v) => {
            if (v.uuid !== offering?.uuid) {
              form.change('plan', v.plan_details);
              form.change('limits', null);
            }
          }}
        />
      </FormContainer>
    </WizardForm>
  );
};
