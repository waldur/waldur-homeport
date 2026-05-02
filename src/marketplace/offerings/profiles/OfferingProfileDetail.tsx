import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useCallback, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceOfferingProfilesAddRole,
  marketplaceOfferingProfilesRemoveRole,
  marketplaceOfferingProfilesRetrieve,
  marketplaceOfferingRolesList,
  rolesList,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { renderFieldOrDash } from '@/table/utils';

const PROFILE_KEY = (uuid: string) => ['offering-profile', uuid];

export const OfferingProfileDetail: FC = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { params } = useCurrentStateAndParams();
  const uuid = params.uuid as string;

  const { data: profile, isLoading } = useQuery({
    queryKey: PROFILE_KEY(uuid),
    queryFn: () =>
      marketplaceOfferingProfilesRetrieve({ path: { uuid } }).then(
        (r: any) => r.data,
      ),
  });

  const refetch = useCallback(
    () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY(uuid) }),
    [queryClient, uuid],
  );

  const [showAdd, setShowAdd] = useState(false);

  const remove = useCallback(
    async (role: any) => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate(
            'Remove role {role} from profile? This will revoke all UserRole grants for this role on bound offerings.',
            { role: <b>{role.name}</b> },
            formatJsxTemplate,
          ),
          { forDeletion: true },
        );
      } catch {
        return;
      }
      try {
        await marketplaceOfferingProfilesRemoveRole({
          path: { uuid },
          body: { role: role.uuid } as any,
        });
        dispatch(showSuccess(translate('Role removed from profile.')));
        await refetch();
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to remove role.')));
      }
    },
    [dispatch, uuid, refetch],
  );

  if (isLoading || !profile) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Card className="mb-3">
        <Card.Body>
          <h3 className="mb-2">{profile.name}</h3>
          <p className="text-muted mb-3">
            {renderFieldOrDash(profile.description)}
          </p>
          <p className="mb-0">
            {translate('Bound offerings: {n}', {
              n: profile.offerings_count ?? 0,
            })}
          </p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="d-flex align-items-center justify-content-between">
          <h5 className="mb-0">{translate('Role catalog')}</h5>
          <ActionButton
            title={translate('Add role')}
            iconNode={<PlusCircleIcon weight="bold" />}
            action={() => setShowAdd(true)}
          />
        </Card.Header>
        <Card.Body>
          {(profile.roles || []).length === 0 ? (
            <p className="text-muted mb-0">
              {translate(
                'No roles in this catalog yet. Add roles below — they become assignable on every offering bound to this profile.',
              )}
            </p>
          ) : (
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>{translate('Role')}</th>
                  <th>{translate('Scope')}</th>
                  <th>{translate('Description')}</th>
                  <th className="text-end">{translate('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {profile.roles.map((r: any) => (
                  <tr key={r.uuid}>
                    <td>{r.name}</td>
                    <td>
                      {r.content_type === 'resource_project'
                        ? translate('Resource project')
                        : r.content_type === 'resource'
                          ? translate('Resource')
                          : renderFieldOrDash(r.content_type)}
                    </td>
                    <td>{renderFieldOrDash(r.description)}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-light text-danger"
                        onClick={() => remove(r)}
                      >
                        <TrashIcon weight="bold" /> {translate('Remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card.Body>
      </Card>

      {showAdd && (
        <AddRoleToProfileDialog
          profileUuid={uuid}
          onClose={() => setShowAdd(false)}
          onAdded={async () => {
            setShowAdd(false);
            await refetch();
          }}
        />
      )}
    </div>
  );
};

const AddRoleToProfileDialog: FC<{
  profileUuid: string;
  onClose(): void;
  onAdded(): void;
}> = ({ profileUuid, onClose, onAdded }) => {
  const dispatch = useDispatch();

  // Available roles = system + offering roles whose content_type is
  // resource or resource_project.
  const { data: roles = [] } = useQuery({
    queryKey: ['offering-profile-add-roles'],
    queryFn: async () => {
      // Pull "free" roles (not yet attached to any offering / profile).
      // For simplicity, list ALL roles and let the user pick.
      const r1 = await rolesList().then((r: any) => r.data || []);
      const r2 = await marketplaceOfferingRolesList().then(
        (r: any) => r.data || [],
      );
      const seen = new Set<string>();
      const merged: any[] = [];
      for (const r of [...r1, ...r2]) {
        const ct = r.content_type || (r as any).content_type;
        if (ct !== 'resource' && ct !== 'resource_project') continue;
        if (seen.has(r.uuid)) continue;
        seen.add(r.uuid);
        merged.push({
          uuid: r.uuid,
          name: r.name,
          content_type: ct,
        });
      }
      return merged;
    },
  });

  const submit = useCallback(
    async (roleUuid: string) => {
      try {
        await marketplaceOfferingProfilesAddRole({
          path: { uuid: profileUuid },
          body: { role: roleUuid } as any,
        });
        dispatch(showSuccess(translate('Role added to profile.')));
        onAdded();
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add role.')));
      }
    },
    [dispatch, profileUuid, onAdded],
  );

  return (
    <div
      className="modal show d-block"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      tabIndex={-1}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{translate('Add role to profile')}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {roles.length === 0 ? (
              <p>{translate('No eligible roles found.')}</p>
            ) : (
              <ul className="list-group">
                {roles.map((r: any) => (
                  <li
                    key={r.uuid}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {r.name}
                      <span className="text-muted ms-2">
                        ({r.content_type})
                      </span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => submit(r.uuid)}
                    >
                      {translate('Add')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" onClick={onClose}>
              {translate('Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
