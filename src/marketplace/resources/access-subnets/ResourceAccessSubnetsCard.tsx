import { FunctionComponent, useMemo } from 'react';
import {
  AccessSubnet,
  Offering,
  Resource,
  accessSubnetsList,
} from 'waldur-js-client';

import {
  HelpIcon,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table as TablePrimitive,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

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
        <Card bordered className="mb-4">
          <CardHeader>
            <CardTitle as="div" className="h5">
              {translate('Default allowed (from provider)')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TablePrimitive>
              <TableHeader>
                <TableRow>
                  <TableHead>{translate('CIDR')}</TableHead>
                  <TableHead>{translate('Description')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaults.map((row) => (
                  <TableRow key={row.uuid}>
                    <TableCell>{row.inet}</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TablePrimitive>
          </CardContent>
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
            <HelpIcon
              label={translate(
                'Defined for this organization and offering, and applied to all of its resources of that offering. Managed under the organization’s access control.',
              )}
              className="ms-1.5"
            />
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
