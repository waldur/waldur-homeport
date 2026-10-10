import { useQueries } from '@tanstack/react-query';
import { FC } from 'react';
import { projectsRetrieve, Offering, Project } from 'waldur-js-client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDate } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { formatPhoneNumber } from '@/core/utils';
import { getCustomer } from '@/customer/utils';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { renderFieldOrDash } from '@/table/utils';
import { Customer } from '@/workspace/types';

import { getServiceProviderByCustomer } from '../common/api';
import { getLabel } from '../common/registry';

import './DetailsOverviewDialog.scss';

const withCopy = (value) => {
  return (
    <div className="d-flex justify-content-between">
      {renderFieldOrDash(value)}
      {value && (
        <CopyToClipboardButton
          value={value}
          size={20}
          className="mb-0 mt-0"
          buttonClassName="text-gray-500"
        />
      )}
    </div>
  );
};

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
      className="resource-details-overview"
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
                <FormTable hideActions alignTop className="gy-5">
                  <FormTable.Item
                    label={translate('Name')}
                    value={withCopy(customer.data.name)}
                  />

                  <FormTable.Item
                    label={translate('Contact info')}
                    group
                    value={[
                      customer.data.contact_details,
                      customer.data.email,
                      formatPhoneNumber(customer.data.phone_number),
                    ]
                      .filter(Boolean)
                      .map((v) => withCopy(v))}
                  />
                </FormTable>
              </TabsContent>
            ) : null}
            {project.data ? (
              <TabsContent value="project">
                <FormTable hideActions alignTop className="gy-5">
                  <FormTable.Item
                    label={translate('Name')}
                    value={withCopy(project.data.data.name)}
                  />

                  <FormTable.Item
                    label={translate('End date')}
                    value={withCopy(
                      project.data.data.end_date
                        ? formatDate(project.data.data.end_date)
                        : null,
                    )}
                  />
                </FormTable>
              </TabsContent>
            ) : null}
            {props.offering && (
              <TabsContent value="offering">
                <FormTable hideActions alignTop className="gy-5">
                  <FormTable.Item
                    label={translate('Name')}
                    value={withCopy(props.offering.name)}
                  />

                  <FormTable.Item
                    label={translate('Type')}
                    value={withCopy(getLabel(props.offering.type))}
                  />

                  {props.offering.parent_name && (
                    <FormTable.Item
                      label={translate('Parent offering')}
                      value={withCopy(getLabel(props.offering.parent_name))}
                    />
                  )}
                </FormTable>
              </TabsContent>
            )}
            {provider.data ? (
              <TabsContent value="service-provider">
                <FormTable hideActions alignTop className="gy-5">
                  <FormTable.Item
                    label={translate('Name')}
                    value={withCopy(provider.data.customer_name)}
                  />

                  <FormTable.Item
                    label={translate('Description')}
                    value={withCopy(provider.data.description)}
                  />
                </FormTable>
              </TabsContent>
            ) : null}
          </div>
        </Tabs>
      )}
    </ModalDialog>
  );
};
