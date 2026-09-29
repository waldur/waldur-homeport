import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  marketplaceOfferingProfilesAddRole,
  marketplaceOfferingProfilesRetrieve,
  marketplaceOfferingRolesList,
  rolesList,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { renderFieldOrDash } from '@/table/utils';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { OfferingProfileRoleRemoveButton } from './OfferingProfileRoleRemoveButton';
import { PROFILE_KEY } from './queryKeys';

export const OfferingProfileDetail: FC = () => {
  const { params } = useCurrentStateAndParams();
  const uuid = params.uuid as string;

  const { data: profile, isLoading } = useQuery({
    queryKey: PROFILE_KEY(uuid),
    queryFn: () =>
      marketplaceOfferingProfilesRetrieve({ path: { uuid } }).then(
        (r: any) => r.data,
      ),
  });

  const [showAdd, setShowAdd] = useState(false);
  // The profile API is read-open; changing the role catalog is staff-only.
  const isStaff = useSelector(isStaffSelector);

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
          {isStaff && (
            <BaseButton
              label={translate('Add role')}
              iconNode={<PlusCircleIcon weight="bold" />}
              onClick={() => setShowAdd(true)}
              variant="tertiary"
              size="lg"
            />
          )}
        </Card.Header>
        <Card.Body>
          <p className="text-muted">
            {translate(
              'These roles can be assigned on every offering bound to this profile, at the scope shown. Adding or removing a role updates the bound offerings in the background.',
            )}
          </p>
          {(profile.roles || []).length === 0 ? (
            <p className="text-muted mb-0">
              {translate('No roles in this catalog yet.')}
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
                      {isStaff && (
                        <OfferingProfileRoleRemoveButton
                          profileUuid={uuid}
                          role={r}
                        />
                      )}
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
          onAdded={() => {
            setShowAdd(false);
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
        const ct = r.content_type;
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

  const { mutate: submit, isPending: submitting } = useManagedMutation<
    any,
    any,
    string
  >({
    mutationFn: (roleUuid) =>
      marketplaceOfferingProfilesAddRole({
        path: { uuid: profileUuid },
        body: { role: roleUuid },
      }),
    successMessage: translate('Role added to profile.'),
    errorMessage: translate('Unable to add role.'),
    onSuccess: onAdded,
    invalidateQueries: [{ queryKey: PROFILE_KEY(profileUuid) }],
    closeModal: false,
  });

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
                    <BaseButton
                      variant="primary"
                      size="sm"
                      onClick={() => submit(r.uuid)}
                      disabled={submitting}
                      disabledReason={translate('Adding role...')}
                      label={translate('Add')}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="modal-footer">
            <BaseButton
              variant="tertiary"
              onClick={onClose}
              label={translate('Close')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
