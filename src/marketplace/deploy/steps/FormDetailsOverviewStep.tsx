import { useQuery } from '@tanstack/react-query';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { Image } from '@/core/Image';
import { translate } from '@/i18n';
import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { CustomerField } from '@/marketplace/details/CustomerField';
import { ProjectField } from '@/marketplace/details/ProjectField';
import { VStepperFormStepCard } from '@/wizard';

import { DetailsOverviewButton } from '../DetailsOverviewButton';
import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

export const FormDetailsOverviewStep = (props: FormStepProps) => {
  const { customer, project } = useOrderFormData();

  const { data: provider } = useQuery({
    queryKey: ['DeployDetailsOverview', 'provider', props.offering?.uuid],

    queryFn: () =>
      props.offering
        ? getServiceProviderByCustomer({
            customer_uuid: props.offering.customer_uuid,
          })
        : null,

    staleTime: STALE_TIME,
  });

  if (props.offering.shared) {
    // Render with organization and project fields
    return (
      <VStepperFormStepCard
        title={translate('General information')}
        id={props.id}
        disabled={props.disabled}
        actions={
          <DetailsOverviewButton
            offering={props.offering}
            customer={customer}
            project={project}
            className="ms-auto"
          />
        }
      >
        <PropertyList
          variant="summary"
          className="grid grid-cols-1 sm:grid-cols-2 text-sm gap-x-5"
          termWidth="sm"
        >
          <PropertyItem
            label={translate('Offering')}
            value={
              <div className="flex items-center self-stretch gap-1.5">
                {props.offering.thumbnail ? (
                  <Image src={props.offering.thumbnail} size={24} circle />
                ) : null}
                {props.offering.name}
              </div>
            }
          />
          <PropertyItem
            label={translate('Service provider')}
            value={provider?.customer_name}
            hideIfEmpty={false}
          />
        </PropertyList>

        <div className="grid grid-cols-1 sm:grid-cols-2 items-end gap-x-5">
          <div>
            <CustomerField
              organizationGroups={props.offering.organization_groups}
              offering={props.offering}
            />
          </div>
          <div>
            <ProjectField
              previewMode={props.previewMode}
              offering={props.offering}
            />
          </div>
        </div>
      </VStepperFormStepCard>
    );
  }

  return (
    <VStepperFormStepCard
      title={translate('Details overview')}
      id={props.id}
      actions={
        <DetailsOverviewButton offering={props.offering} className="ms-auto" />
      }
    >
      <PropertyList
        variant="summary"
        className="grid grid-cols-1 sm:grid-cols-2 text-sm gap-x-5"
        termWidth="md"
      >
        <PropertyItem
          label={translate('Organization')}
          value={props.offering.customer_name}
        />
        <PropertyItem
          label={translate('Project')}
          value={props.offering.project_name}
        />
        <PropertyItem
          label={translate('Offering')}
          value={
            <div className="flex items-center self-stretch gap-1.5">
              {props.offering.thumbnail ? (
                <Image src={props.offering.thumbnail} size={24} circle />
              ) : null}
              {props.offering.name}
            </div>
          }
        />
        <PropertyItem
          label={translate('Service provider')}
          value={provider?.customer_name}
          hideIfEmpty={false}
        />
      </PropertyList>
    </VStepperFormStepCard>
  );
};
