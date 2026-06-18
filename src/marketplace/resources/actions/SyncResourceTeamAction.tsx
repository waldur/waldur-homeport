import { UsersThreeIcon } from '@phosphor-icons/react';
import { remoteWaldurApiSyncResourceProjectPermissions } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

// States in which the resource does not exist (or no longer exists) on the
// remote site, so there is no remote team to synchronise against.
const NON_SYNCABLE_STATES = ['Creating', 'Terminating', 'Terminated'];

/**
 * Staff-only action that pushes the project team members of a remote
 * marketplace resource to the remote site by calling
 * POST /api/remote-waldur-api/sync_resource_project_permissions/{uuid}/.
 *
 * Backend gates mirrored here (see marketplace_remote/views.py):
 *  - IsStaff               -> rendered only for staff (see below + ResourceActionComponent)
 *  - offering.type==remote -> hidden for non-remote offerings
 *  - sync_resource_team()  -> needs resource.backend_id and an existing remote
 *                             resource, so the action is disabled until the
 *                             resource is provisioned and in a live state.
 */
export const SyncResourceTeamAction = ({ resource, ...rest }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiSyncResourceProjectPermissions({
        path: { uuid: resource.uuid },
      }),
    successMessage: translate('Team members have been synchronised.'),
    errorMessage: translate('Unable to synchronise team members.'),
  });

  if (resource.offering_type !== REMOTE_OFFERING_TYPE) {
    return null;
  }

  let tooltip: string | undefined;
  if (!resource.backend_id) {
    tooltip = translate(
      'The resource has not been provisioned on the remote site yet.',
    );
  } else if (NON_SYNCABLE_STATES.includes(resource.state)) {
    tooltip = translate(
      'Team members can be synchronised only for an active resource.',
    );
  }

  return (
    <ActionItem
      title={translate('Sync team members')}
      action={mutate}
      disabled={isPending || Boolean(tooltip)}
      tooltip={tooltip}
      {...rest}
      iconNode={<UsersThreeIcon weight="bold" />}
      staff
    />
  );
};
