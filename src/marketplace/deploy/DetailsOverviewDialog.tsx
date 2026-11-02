import { useQueries } from '@tanstack/react-query';
import { FC } from 'react';
import { projectsRetrieve, Offering, Project } from 'waldur-js-client';

import {
  PropertyItem,
  PropertyList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { formatPhoneNumber } from '@/core/utils';
import { getCustomer } from '@/customer/utils';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';
import { Customer } from '@/workspace/types';

import { getServiceProviderByCustomer } from '../common/api';
import { getLabel } from '../common/registry';

export const DetailsOverviewDialog: FC<{
  offering: Offering;
  customer?: Customer;
  project?: Project;
}> = (props) => {
  const [customer, project, provider] = useQueries({
    queries: [
      props.customer
        ? {
            queryKey: ['customer', props.customer?.uuid],
            queryFn: () => getCustomer(props.customer.uuid),
            staleTime: STALE_TIME,
          }
        : {
            queryKey: ['offering', 'customer', props.offering?.uuid],
            queryFn: () =>
              props.offering.customer_uuid
                ? getCustomer(props.offering.customer_uuid)
                : null,
            staleTime: STALE_TIME,
          },
      props.project
        ? {
            queryKey: ['project', props.project?.uuid],
            queryFn: () =>
              projectsRetrieve({ path: { uuid: props.project.uuid } }),
            staleTime: STALE_TIME,
          }
        : {
            queryKey: ['offering', 'project', props.offering?.uuid],
            queryFn: () =>
              props.offering.project_uuid
                ? projectsRetrieve({
                    path: { uuid: props.offering.project_uuid },
                  })
                : null,
            staleTime: STALE_TIME,
          },
      {
        queryKey: ['offering', 'provider', props.offering?.uuid],
        queryFn: () =>
          props.offering?.uuid
            ? getServiceProviderByCustomer({
                customer_uuid: props.offering.customer_uuid,
              })
            : null,
        staleTime: STALE_TIME,
      },
    ],
  });

  const isLoading = [customer, project, provider].some(
    (result) => result.isLoading,
  );

  return (
    <ModalDialog
      title={translate('Resource details overview')}
      subtitle={translate(
        'View key details about the organization, project, offering, and provider for your resource.',
      )}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Tabs mount="active" defaultValue="organization">
          <TabsList>
            {customer.data ? (
              <TabsTrigger value="organization">
                {translate('Organization')}
              </TabsTrigger>
            ) : null}
            {project.data ? (
              <TabsTrigger value="project">{translate('Project')}</TabsTrigger>
            ) : null}
            {props.offering && (
              <TabsTrigger value="offering">
                {translate('Offering')}
              </TabsTrigger>
            )}
            {provider.data ? (
              <TabsTrigger value="service-provider">
                {translate('Service provider')}
              </TabsTrigger>
            ) : null}
          </TabsList>
          <div className="tab-content">
            {customer.data ? (
              <TabsContent value="organization">
                <PropertyList hideActions alignTop detailsMode>
                  <PropertyItem
                    label={translate('Name')}
                    value={customer.data.name}
                    hasCopy
                  />

                  <PropertyItem
                    label={translate('Contact info')}
                    value={[
                      customer.data.contact_details,
                      customer.data.email,
                      formatPhoneNumber(customer.data.phone_number),
                    ].filter(Boolean)}
                    copyable
                  />
                </PropertyList>
              </TabsContent>
            ) : null}
            {project.data ? (
              <TabsContent value="project">
                <PropertyList hideActions alignTop detailsMode>
                  <PropertyItem
                    label={translate('Name')}
                    value={project.data.data.name}
                    hasCopy
                  />

                  <PropertyItem
                    label={translate('End date')}
                    value={propVal.date(project.data.data.end_date)}
                    hasCopy
                  />
                </PropertyList>
              </TabsContent>
            ) : null}
            {props.offering && (
              <TabsContent value="offering">
                <PropertyList hideActions alignTop detailsMode>
                  <PropertyItem
                    label={translate('Name')}
                    value={props.offering.name}
                    hasCopy
                  />

                  <PropertyItem
                    label={translate('Type')}
                    value={getLabel(props.offering.type)}
                    hasCopy
                  />

                  {props.offering.parent_name && (
                    <PropertyItem
                      label={translate('Parent offering')}
                      value={getLabel(props.offering.parent_name)}
                      hasCopy
                    />
                  )}
                </PropertyList>
              </TabsContent>
            )}
            {provider.data ? (
              <TabsContent value="service-provider">
                <PropertyList hideActions alignTop detailsMode>
                  <PropertyItem
                    label={translate('Name')}
                    value={provider.data.customer_name}
                    hasCopy
                  />

                  <PropertyItem
                    label={translate('Description')}
                    value={provider.data.description}
                    hasCopy
                  />
                </PropertyList>
              </TabsContent>
            ) : null}
          </div>
        </Tabs>
      )}
    </ModalDialog>
  );
};
