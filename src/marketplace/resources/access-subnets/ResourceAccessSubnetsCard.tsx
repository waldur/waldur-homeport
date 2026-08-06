import { QuestionIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { Card, Table as BsTable } from 'react-bootstrap';
import {
  AccessSubnet,
  Offering,
  Resource,
  accessSubnetsList,
} from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface ResourceAccessSubnetsCardProps {
  resource: Resource;
  offering?: Offering;
}

/**
 * Read-only view of the access subnets that apply to this resource.
 *
 * The list is defined once per (customer, offering) pair and applies to every
 * resource the organization holds of that offering, so it is not editable from
 * here — this view exists so that "why can my IP not reach this?" is answerable
 * where the user is actually looking. Editing lives on the organization's
 * access-control page.
 */
export const ResourceAccessSubnetsCard: FunctionComponent<
  ResourceAccessSubnetsCardProps
> = ({ resource, offering }) => {
  const defaults = offering?.default_access_subnets ?? [];
  const filter = useMemo(
    () => ({
      customer_uuid: resource.customer_uuid,
      offering_uuid: resource.offering_uuid,
    }),
    [resource.customer_uuid, resource.offering_uuid],
  );
  const tableProps = useTable({
    table: `resourceEffectiveAccessSubnets-${resource.uuid}`,
    filter,
    fetchData: createFetcher(accessSubnetsList),
    queryField: 'description',
  });

  return (
    <>
      {defaults.length > 0 && (
        <Card className="card-bordered mb-5">
          <Card.Header>
            <Card.Title className="h5">
              {translate('Default allowed (from provider)')}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <BsTable bordered={true} hover={true} responsive={true}>
              <thead>
                <tr>
                  <th>{translate('CIDR')}</th>
                  <th>{translate('Description')}</th>
                </tr>
              </thead>
              <tbody>
                {defaults.map((row) => (
                  <tr key={row.uuid}>
                    <td>{row.inet}</td>
                    <td>{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </BsTable>
          </Card.Body>
        </Card>
      )}

      <Table<AccessSubnet>
        {...tableProps}
        id="resource-access-subnets"
        // The explanation rides on the title rather than sitting above the
        // table: it answers "why can I not edit this here?", which is only
        // asked once, and a standing paragraph competes with the data.
        title={
          <>
            {translate('Access subnets')}
            <Tip
              id="resource-access-subnets-help"
              label={translate(
                'Defined for this organization and offering, and applied to all of its resources of that offering. Managed under the organization’s access control.',
              )}
              className="ms-2"
            >
              <QuestionIcon size={16} weight="bold" className="text-muted" />
            </Tip>
          </>
        }
        columns={[
          {
            title: translate('CIDR'),
            render: ({ row }) => <>{row.inet}</>,
          },
          {
            title: translate('Description'),
            render: ({ row }) => <>{row.description}</>,
          },
        ]}
        verboseName={translate('Access subnets')}
        hasQuery
        tableActions={
          <FilteredEventsButton
            filter={{ scope: resource.url, feature: ['access_subnets'] }}
          />
        }
      />
    </>
  );
};
