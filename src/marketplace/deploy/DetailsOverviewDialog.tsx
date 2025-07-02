import { useQueries } from '@tanstack/react-query';
import { FC } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { projectsRetrieve } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatPhoneNumber } from '@waldur/core/utils';
import { getCustomer } from '@waldur/customer/utils';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { renderFieldOrDash } from '@waldur/table/utils';
import { Customer } from '@waldur/workspace/types';

import { getServiceProviderByCustomer } from '../common/api';
import { getLabel } from '../common/registry';
import { Offering } from '../types';

import './DetailsOverviewDialog.scss';

const STALE_TIME = 5 * 60 * 1000;

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
      closeButton
      className="resource-details-overview"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Tabs
          defaultActiveKey={1}
          unmountOnExit={true}
          className="nav-line-tabs"
        >
          {customer.error ? (
            <LoadingErred loadData={customer.refetch} />
          ) : customer.data ? (
            <Tab eventKey={1} title={translate('Organization')}>
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
            </Tab>
          ) : null}
          {project.error ? (
            <LoadingErred loadData={project.refetch} />
          ) : project.data ? (
            <Tab eventKey={2} title={translate('Project')}>
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
            </Tab>
          ) : null}
          {props.offering && (
            <Tab eventKey={3} title={translate('Offering')}>
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
            </Tab>
          )}
          {provider.error ? (
            <LoadingErred loadData={provider.refetch} />
          ) : provider.data ? (
            <Tab eventKey={4} title={translate('Service provider')}>
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
            </Tab>
          ) : null}
        </Tabs>
      )}
    </ModalDialog>
  );
};
