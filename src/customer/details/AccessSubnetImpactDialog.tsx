import { FC, useMemo } from 'react';
import {
  AccessSubnetImpactResource,
  accessSubnetsResourceImpactRetrieve,
} from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface AccessSubnetImpactDialogProps {
  resolve: {
    customerUuid: string;
    /** Set to answer "what does this one address reach?" instead. */
    accessSubnetUuid?: string;
    inet?: string;
  };
}

const AddressList = ({ row }: { row: AccessSubnetImpactResource }) => {
  if (!row.addresses.length) {
    return (
      <span className="text-danger">
        {translate('Reachable from anywhere — no addresses listed.')}
      </span>
    );
  }
  // The merged form is only worth showing when merging actually collapsed
  // something; otherwise it repeats the badges verbatim.
  const listed = row.addresses.map((address) => address.inet).sort();
  const packed = [...row.packed].sort();
  const merged =
    packed.length !== listed.length ||
    packed.some((value, index) => value !== listed[index]);

  return (
    <>
      <div className="d-flex flex-wrap gap-1">
        {row.addresses.map((address) => (
          <Badge
            key={`${address.source}-${address.inet}`}
            variant={
              address.source === 'provider_default' ? 'secondary' : 'default'
            }
            outline
            tooltip={
              address.source === 'provider_default'
                ? translate('Published by the service provider.')
                : address.description || undefined
            }
          >
            {address.inet}
          </Badge>
        ))}
      </div>
      {merged && (
        <small className="text-muted">
          {translate('Sent to the firewall as {packed}', {
            packed: row.packed.join(', '),
          })}
        </small>
      )}
    </>
  );
};

/**
 * What the access subnets actually mean for resources.
 *
 * The subnets table answers "which addresses are trusted for what"; this
 * answers the question that follows — is a given resource protected, and from
 * where can it be reached. It also surfaces the two things the table cannot:
 * resources nothing restricts, and lists that are advisory rather than
 * enforced.
 */
export const AccessSubnetImpactDialog: FC<AccessSubnetImpactDialogProps> = ({
  resolve,
}) => {
  const { customerUuid, accessSubnetUuid, inet } = resolve;
  const filter = useMemo(
    () => ({
      customer_uuid: customerUuid,
      ...(accessSubnetUuid ? { access_subnet_uuid: accessSubnetUuid } : {}),
    }),
    [customerUuid, accessSubnetUuid],
  );
  // The table owns the fetch rather than mirroring a separate useQuery into it:
  // a fetchData closing over already-fetched rows captures the empty array from
  // the first render and never re-runs, so the table stays empty.
  const tableProps = useTable({
    table: `access-subnet-impact-${customerUuid}-${accessSubnetUuid ?? 'all'}`,
    filter,
    fetchData: async () => {
      const response = await accessSubnetsResourceImpactRetrieve({
        query: filter,
      });
      const resources = response.data?.resources ?? [];
      return { rows: resources, resultCount: resources.length };
    },
  });

  const rows: AccessSubnetImpactResource[] = tableProps.rows ?? [];
  const unrestricted = rows.filter((row) => row.unrestricted);
  const advisoryOnly = rows.filter((row) => !row.concealment_enabled);

  return (
    <ModalDialog
      title={
        accessSubnetUuid
          ? translate('Resources reached by {inet}', { inet })
          : translate('Resource impact')
      }
    >
      {unrestricted.length > 0 && (
        <AlertItem
          variant="warning"
          className="mb-4"
          title={translate('{count} resource(s) are reachable from anywhere', {
            count: unrestricted.length,
          })}
          body={translate(
            'Their offering supports access subnets, but no address is listed for them.',
          )}
        />
      )}
      {advisoryOnly.length > 0 && (
        <AlertItem
          variant="info"
          className="mb-4"
          title={translate('{count} resource(s) are advisory only', {
            count: advisoryOnly.length,
          })}
          body={translate(
            'The list is published for an external firewall to enforce. This portal does not block traffic on it.',
          )}
        />
      )}

      <Table<AccessSubnetImpactResource>
        {...tableProps}
        id="access-subnet-impact"
        columns={[
          {
            title: translate('Resource'),
            render: ({ row }) => (
              <>
                <div>{row.resource_name}</div>
                <small className="text-muted">{row.project_name}</small>
              </>
            ),
          },
          {
            title: translate('Offering'),
            render: ({ row }) => <>{row.offering_name}</>,
          },
          {
            title: translate('Reachable from'),
            render: ({ row }) => <AddressList row={row} />,
          },
          {
            title: translate('Enforcement'),
            render: ({ row }) =>
              row.concealment_enabled ? (
                <Badge variant="success" outline>
                  {translate('Enforced')}
                </Badge>
              ) : (
                <Badge variant="default" outline>
                  {translate('Advisory')}
                </Badge>
              ),
          },
        ]}
        verboseName={translate('resources')}
        hideTitle
        hasActionBar={false}
        placeholderHasRetry={false}
        cardBordered={false}
      />
    </ModalDialog>
  );
};
