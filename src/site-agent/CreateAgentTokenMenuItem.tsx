import { FC } from 'react';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { SITE_AGENT_TEMPLATE } from '@/user/personal-access-tokens/wizard/tokenPayload';

import { useSiteAgentTokenTarget } from './useSiteAgentTokenTarget';

const PersonalAccessTokenCreateDialog = lazyComponent(() =>
  import('@/user/personal-access-tokens/PersonalAccessTokenCreateDialog').then(
    (module) => ({ default: module.PersonalAccessTokenCreateDialog }),
  ),
);

interface CreateAgentTokenMenuItemProps {
  offering: {
    uuid: string;
    name: string;
  };
}

/**
 * The Actions menu's entry that opens the token wizard for this offering's
 * site agent. Shown when the backend lists the offering as a target for the
 * user: to the offering's managers and to the owners of its organization,
 * when that organization is a service provider. Anyone else, and an offering
 * whose organization is not a service provider, gets no entry.
 */
export const CreateAgentTokenMenuItem: FC<CreateAgentTokenMenuItemProps> = ({
  offering,
}) => {
  const { openDialog } = useModal();
  const { data: target, isLoading } = useSiteAgentTokenTarget(offering.uuid);

  if (isLoading || !target) return null;

  return (
    <Menu.Item
      onSelect={() =>
        openDialog(PersonalAccessTokenCreateDialog, {
          size: 'lg',
          resolve: {
            preset: {
              template: SITE_AGENT_TEMPLATE,
              target,
              offering: { uuid: offering.uuid, name: offering.name },
            },
          },
        })
      }
    >
      {translate('Create agent token')}
    </Menu.Item>
  );
};
