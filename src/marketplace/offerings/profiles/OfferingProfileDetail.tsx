import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';
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
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
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

  const { openDialog } = useModal();
  // The profile API is read-open; changing the role catalog is staff-only.
  const isStaff = useSelector(isStaffSelector);

  if (isLoading || !profile) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="card mb-2.5">
        <div className="card-body">
          <h3 className="mb-1.5">{profile.name}</h3>
          <p className="text-quaternary mb-2.5">
            {renderFieldOrDash(profile.description)}
          </p>
          <p className="mb-0">
            {translate('Bound offerings: {n}', {
              n: profile.offerings_count ?? 0,
            })}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h5 className="mb-0">{translate('Role catalog')}</h5>
          {isStaff && (
            <BaseButton
              label={translate('Add role')}
              iconNode={<PlusCircleIcon weight="bold" />}
              onClick={() =>
                openDialog(AddRoleToProfileDialog, {
                  resolve: { profileUuid: uuid },
                })
              }
              variant="tertiary"
              size="lg"
            />
          )}
        </div>
        <div className="card-body">
          <p className="text-quaternary">
            {translate(
              'These roles can be assigned on every offering bound to this profile, at the scope shown. Adding or removing a role updates the bound offerings in the background.',
            )}
          </p>
          {(profile.roles || []).length === 0 ? (
            <p className="text-quaternary mb-0">
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
        </div>
      </div>
    </div>
  );
};

const AddRoleToProfileDialog: FC<{
  resolve: { profileUuid: string };
}> = ({ resolve: { profileUuid } }) => {
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
    invalidateQueries: [{ queryKey: PROFILE_KEY(profileUuid) }],
  });

  return (
    <ModalDialog
      title={translate('Add role to profile')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {roles.length === 0 ? (
        <p>{translate('No eligible roles found.')}</p>
      ) : (
        <ul className="border-[1px] border-secondary rounded divide-y divide-secondary">
          {roles.map((r: any) => (
            <li
              key={r.uuid}
              className="px-4 py-2 flex justify-between items-center"
            >
              <span>
                {r.name}
                <span className="text-quaternary ms-1.5">
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
    </ModalDialog>
  );
};
