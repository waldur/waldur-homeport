import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo } from 'react';
import {
  proposalProtectedCallsOfferingsList,
  RequestedOffering,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { STALE_TIME } from '@waldur/core/constants';
import { required } from '@waldur/core/validators';
import { FormContainer, SelectField, StringField } from '@waldur/form';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

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

  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { offering } = wizardProps.formValues;

        useEffect(() => {
          if (!offering) return;
          const fullOffering = (offeringsQuery?.data || []).find(
            (item) => item.uuid === offering.uuid,
          );
          if (fullOffering) {
            wizardProps.change('offering', fullOffering);
            wizardProps.change('plan', fullOffering.plan_details);
          } else {
            wizardProps.change('offering', null);
          }
        }, [offeringsQuery?.data, offering]);

        return (
          <FormContainer
            submitting={wizardProps.submitting}
            className="size-lg"
          >
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
                  wizardProps.change('plan', v.plan_details);
                  wizardProps.change('limits', null);
                }
              }}
            />
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
