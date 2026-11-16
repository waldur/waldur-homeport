import { BooksIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  proposalProposalsList,
  proposalPublicCallsRetrieve,
  proposalStepDiscussionsRetrieve,
} from 'waldur-js-client';

import { BaseButton, Menu, MenuDisclosure } from 'waldur-ui';

import { translate } from '@/i18n';
import { NavMenuLink } from '@/navigation/NavMenu';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

/** The discussion a room is for; shared with the header's title. */
export const useRoomDiscussion = (uuid: string) =>
  useQuery({
    queryKey: ['matrix-room-discussion', uuid],
    queryFn: async () =>
      (await proposalStepDiscussionsRetrieve({ path: { uuid } })).data,
    staleTime: 5 * 60 * 1000,
  });

/**
 * What a discussion is about, to read beside it: its proposal, or for a
 * round's discussion the proposals of the round on its panel; and for whoever
 * manages the call, the call's management. With the chat docked beside the
 * page (the drawer's pin), the page changes and the conversation stays.
 */
export const DiscussionMaterials: FC<{ uuid: string }> = ({ uuid }) => {
  const user = useUser();
  const { data: discussion } = useRoomDiscussion(uuid);
  const roundScoped = Boolean(discussion && !discussion.proposal_uuid);
  // The backend lists only the proposals the viewer may read.
  const { data: proposals } = useQuery({
    queryKey: [
      'discussion-materials-proposals',
      discussion?.round_uuid,
      discussion?.panel_uuid,
    ],
    queryFn: async () =>
      (
        await proposalProposalsList({
          query: {
            round_uuid: discussion!.round_uuid,
            ...(discussion!.panel_uuid
              ? { panel_uuid: discussion!.panel_uuid }
              : {}),
            o: ['slug'],
            page_size: 50,
          },
        })
      ).data,
    enabled: roundScoped,
    staleTime: 5 * 60 * 1000,
  });
  // Whether the viewer manages the call, asked as the call's management pages
  // ask it (canUpdateCall): on the call itself or on its organizer, which
  // only the call names.
  const { data: call } = useQuery({
    queryKey: ['discussion-materials-call', discussion?.call_uuid],
    queryFn: async () =>
      (
        await proposalPublicCallsRetrieve({
          path: { uuid: discussion!.call_uuid },
        })
      ).data,
    enabled: Boolean(discussion?.call_uuid),
    staleTime: 5 * 60 * 1000,
  });
  if (!discussion) return null;
  const managesCall = Boolean(
    user &&
    call &&
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_CALL,
      scopeId: call.uuid,
      callOrganizerId: call.manager_uuid,
    }),
  );

  return (
    <MenuDisclosure>
      <MenuDisclosure.Trigger asChild>
        <BaseButton
          iconNode={<BooksIcon weight="bold" />}
          label={translate('Materials')}
          variant="tertiary-ghost"
          size="sm"
          data-testid="discussion-materials"
        />
      </MenuDisclosure.Trigger>
      <MenuDisclosure.Content align="end" density="compact">
        {discussion.proposal_uuid ? (
          <>
            <Menu.Label>{translate('Proposal')}</Menu.Label>
            <NavMenuLink
              state="proposals.manage-proposal"
              params={{ proposal_uuid: discussion.proposal_uuid }}
              label={discussion.proposal_name || discussion.proposal_slug}
            />
          </>
        ) : (
          <>
            <Menu.Label>
              {discussion.panel_name
                ? translate('Proposals on {panel}', {
                    panel: discussion.panel_name,
                  })
                : translate('Proposals of {round}', {
                    round: discussion.round_name,
                  })}
            </Menu.Label>
            {proposals?.length ? (
              proposals.map((proposal) => (
                <NavMenuLink
                  key={proposal.uuid}
                  state="proposals.manage-proposal"
                  params={{ proposal_uuid: proposal.uuid }}
                  label={proposal.name || proposal.slug}
                />
              ))
            ) : (
              <Menu.Item disabled>
                {proposals
                  ? translate('No proposal you may read')
                  : translate('Loading…')}
              </Menu.Item>
            )}
          </>
        )}
        {managesCall && (
          <>
            <Menu.Separator />
            <NavMenuLink
              state="protected-call.manage"
              params={{ call_uuid: discussion.call_uuid, tab: 'proposals' }}
              label={translate('Manage {call}', { call: discussion.call_name })}
            />
          </>
        )}
      </MenuDisclosure.Content>
    </MenuDisclosure>
  );
};
