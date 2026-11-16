import { useQuery } from '@tanstack/react-query';
import { Field } from 'react-final-form';
import {
  marketplacePublicOfferingsRetrieve,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { StepCard } from 'waldur-ui';

import { SelectField } from '@/form/select/SelectField';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';

export const ManagedFormOpenStackOfferingStep = (props: FormStepProps) => {
  const { data: offerings, isLoading } = useQuery<
    {},
    {},
    PublicOfferingDetails[]
  >({
    queryKey: ['nodes-step-openstack-offering', props.offering.uuid],
    queryFn: () =>
      Promise.all(
        props.offering.plugin_options.openstack_offering_uuid_list.map((uuid) =>
          marketplacePublicOfferingsRetrieve({
            path: { uuid },
            query: { field: ['name', 'uuid', 'scope_uuid', 'type'] },
          }).then((response) => response.data),
        ),
      ),
  });

  return (
    <StepCard
      title={translate('OpenStack offering')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledReason={props.disabledReason}
    >
      <Field name="attributes.openstack_offering">
        {({ input, meta }) => (
          <SelectField
            input={input}
            meta={meta}
            options={offerings}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
          />
        )}
      </Field>
    </StepCard>
  );
};
