import { useQuery } from '@tanstack/react-query';
import { Field } from 'redux-form';
import {
  marketplacePublicOfferingsRetrieve,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { SelectField } from '@waldur/form/SelectField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

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
            query: { field: ['name', 'uuid', 'scope_uuid'] },
          }).then((response) => response.data),
        ),
      ),
  });

  return (
    <VStepperFormStepCard
      title={translate('OpenStack offering')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <Field
        name="attributes.openstack_offering"
        component={SelectField}
        options={offerings}
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
      />
    </VStepperFormStepCard>
  );
};
