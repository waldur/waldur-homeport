import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Table } from 'react-bootstrap';
import { marketplaceOfferingUsersPosixIdentitiesList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { renderFieldOrDash } from '@/table/utils';

const NAMESPACE_LABELS = {
  uid: () => translate('UID'),
  gid: () => translate('GID'),
};

export const UserPosixIdentitiesDialog: FC<{
  resolve: { userUuid: string };
}> = ({ resolve: { userUuid } }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-posix-identities', userUuid],
    queryFn: () =>
      marketplaceOfferingUsersPosixIdentitiesList({
        query: { user_uuid: userUuid },
      }).then((response) => response.data),
    staleTime: 60 * 1000,
  });

  return (
    <ModalDialog
      title={translate('POSIX identities')}
      footer={
        <CloseDialogButton label={translate('Close')} className="w-150px" />
      }
    >
      <p className="text-secondary fs-7 mb-2">
        {translate(
          'All POSIX identifiers across the offering accounts. The same project can have different GIDs per offering, since each offering runs its own directory and pools.',
        )}
      </p>
      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.length === 0 ? (
        <p className="text-secondary mb-0">
          {translate('No POSIX identifiers found.')}
        </p>
      ) : (
        <Table size="sm" responsive className="mb-0">
          <thead>
            <tr>
              <th>{translate('Offering')}</th>
              <th>{translate('Type')}</th>
              <th>{translate('Value')}</th>
              <th>{translate('Project')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{renderFieldOrDash(row.offering_name)}</td>
                <td>
                  {renderFieldOrDash(
                    NAMESPACE_LABELS[row.namespace]?.() ?? row.namespace,
                  )}
                </td>
                <td>{renderFieldOrDash(row.value)}</td>
                <td>{renderFieldOrDash(row.context)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </ModalDialog>
  );
};
