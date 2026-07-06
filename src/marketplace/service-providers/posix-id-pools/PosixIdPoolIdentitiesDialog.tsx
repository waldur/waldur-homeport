import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Badge, Table } from 'react-bootstrap';
import { marketplacePosixIdentitiesList, PosixIdPool } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { renderFieldOrDash } from '@/table/utils';

interface PosixIdPoolIdentitiesDialogProps {
  resolve: { pool: PosixIdPool };
}

const CONSUMER_TYPE_LABELS = {
  offeringuser: translate('Offering user'),
  robotaccount: translate('Robot account'),
  offeringusergroup: translate('Project group'),
  offeringrolegroup: translate('Role group'),
};

export const PosixIdPoolIdentitiesDialog: FC<
  PosixIdPoolIdentitiesDialogProps
> = ({ resolve: { pool } }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posix-id-pool-identities', pool.uuid],
    queryFn: () =>
      marketplacePosixIdentitiesList({
        query: { pool_uuid: pool.uuid, page_size: 200 },
      }).then((response) => response.data),
  });

  return (
    <ModalDialog title={translate('POSIX identities')}>
      <div className="size-lg">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <p className="text-danger mb-0">
            {translate('Unable to load identities.')}
          </p>
        ) : !data || data.length === 0 ? (
          <p className="text-secondary mb-0">
            {translate('No identifiers have been issued from this pool yet.')}
          </p>
        ) : (
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>{translate('UID')}</th>
                <th>{translate('GID')}</th>
                <th>{translate('Account')}</th>
                <th>{translate('Type')}</th>
                <th>{translate('Offering')}</th>
                <th>{translate('Issued')}</th>
                <th>{translate('Released')}</th>
                <th>{translate('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((identity) => (
                <tr key={identity.uuid}>
                  <td>{renderFieldOrDash(identity.uid)}</td>
                  <td>{renderFieldOrDash(identity.gid)}</td>
                  <td>{renderFieldOrDash(identity.consumer_name)}</td>
                  <td>
                    {CONSUMER_TYPE_LABELS[identity.consumer_type] ??
                      renderFieldOrDash(identity.consumer_type)}
                  </td>
                  <td>{renderFieldOrDash(identity.offering_name)}</td>
                  <td>{formatDateTime(identity.created)}</td>
                  <td>
                    {identity.released_at
                      ? formatDateTime(identity.released_at)
                      : renderFieldOrDash(null)}
                  </td>
                  <td>
                    {identity.released_at ? (
                      <Badge bg="light-warning" text="warning">
                        {translate('Released')}
                      </Badge>
                    ) : (
                      <Badge bg="light-success" text="success">
                        {translate('Active')}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </ModalDialog>
  );
};
