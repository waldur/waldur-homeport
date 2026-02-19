import { TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceOfferingUserRolesDestroy,
  OfferingKeycloakMembership,
  offeringKeycloakMembershipsList,
} from 'waldur-js-client';

import Avatar from '@waldur/core/Avatar';
import { Badge } from '@waldur/core/Badge';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { renderFieldOrDash } from '@waldur/table/utils';

export const DeleteRoleDialog = ({
  resolve: { row, refetch },
}: {
  resolve: { row; refetch };
}) => {
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);

  const { data: memberships, isLoading } = useQuery({
    queryKey: ['keycloak-memberships-for-role', row.uuid],
    queryFn: () =>
      offeringKeycloakMembershipsList({
        query: { role_uuid: row.uuid },
      }).then((r) => r.data),
  });

  const handleDelete = useCallback(async () => {
    setSubmitting(true);
    try {
      await marketplaceOfferingUserRolesDestroy({ path: { uuid: row.uuid } });
      dispatch(showSuccess(translate('Role has been removed.')));
      if (refetch) await refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to remove role.')));
    } finally {
      setSubmitting(false);
    }
  }, [dispatch, row.uuid, refetch]);

  return (
    <ModalDialog
      title={translate('Delete role {name}', { name: row.name })}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      footer={
        <>
          <CloseDialogButton className="flex-equal" />
          <SubmitButton
            submitting={submitting}
            disabled={isLoading}
            variant="danger"
            className="flex-equal"
            onClick={handleDelete}
            type="button"
            label={translate('Delete')}
          />
        </>
      }
    >
      {isLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner />
          <p className="text-muted mt-2">
            {translate('Loading affected memberships...')}
          </p>
        </div>
      ) : memberships && memberships.length > 0 ? (
        <>
          <div className="alert alert-warning mb-4">
            {translate(
              'Deleting this role will revoke Keycloak access for {count} user(s). This action cannot be undone.',
              { count: <b>{memberships.length}</b> },
              formatJsxTemplate,
            )}
          </div>
          <h6 className="mb-3">{translate('Affected users')}</h6>
          <div className="card card-table card-bordered">
            <div className="card-body p-0">
              <table className="table align-middle mb-0">
                <thead>
                  <tr className="align-middle">
                    <th>{translate('User')}</th>
                    <th>{translate('Email')}</th>
                    <th>{translate('Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((m: OfferingKeycloakMembership) => (
                    <tr key={m.uuid}>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <Avatar name={m.email} size={30} circle />
                          <span>
                            {renderFieldOrDash(
                              [m.first_name, m.last_name]
                                .filter(Boolean)
                                .join(' '),
                            )}
                          </span>
                        </div>
                      </td>
                      <td>{m.email}</td>
                      <td>
                        {m.state === 'active' ? (
                          <Badge variant="success" pill outline>
                            {translate('Active')}
                          </Badge>
                        ) : (
                          <Badge variant="warning" pill outline>
                            {translate('Pending')}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p>{translate('Are you sure you want to delete this role?')}</p>
      )}
    </ModalDialog>
  );
};
