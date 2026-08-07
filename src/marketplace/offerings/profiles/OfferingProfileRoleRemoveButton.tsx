import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceOfferingProfilesRemoveRole } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { PROFILE_KEY } from './queryKeys';

interface OfferingProfileRoleRemoveButtonProps {
  profileUuid: string;
  role: any;
}

export const OfferingProfileRoleRemoveButton: FC<
  OfferingProfileRoleRemoveButtonProps
> = ({ profileUuid, role }) => {
  const removeMutation = useManagedMutation<any, any, any>({
    mutationFn: () =>
      marketplaceOfferingProfilesRemoveRole({
        path: { uuid: profileUuid },
        body: { role: role.uuid },
      }),
    successMessage: translate('Role removed from profile.'),
    errorMessage: translate('Unable to remove role.'),
    invalidateQueries: [{ queryKey: PROFILE_KEY(profileUuid) }],
    confirmation: {
      title: translate('Confirmation'),
      body: () =>
        translate(
          'Remove role {role} from profile? This will revoke all UserRole grants for this role on bound offerings.',
          { role: <b>{role.name}</b> },
          formatJsxTemplate,
        ),
      options: { forDeletion: true },
    },
  });

  return (
    <button
      type="button"
      className="btn btn-sm btn-light text-danger"
      onClick={() => removeMutation.mutate()}
      disabled={removeMutation.isPending}
    >
      <TrashIcon weight="bold" /> {translate('Remove')}
    </button>
  );
};
