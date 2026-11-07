import { ArrowBendUpRightIcon, UsersIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderRequestedOffering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { OfferingRequestItemActions } from '@/proposals/offering-requests/OfferingRequestItemActions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { router } from '@/router';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { offeringTeamLink } from './providerCalls';

const DefaultDelegateDialog = lazyComponent(() =>
  import('./DefaultDelegateDialog').then((module) => ({
    default: module.DefaultDelegateDialog,
  })),
);

/**
 * A call the offering is in: a request to answer, or, once accepted, who new
 * slots go to and the way to the offering's team.
 */
export const makeProviderCallRowActions = (
  providerUuid: string,
): FC<{ row: ProviderRequestedOffering; fetch: () => void }> =>
  function ProviderCallRowActions({ row, fetch }) {
    const { openDialog } = useModal();
    if (row.state !== 'accepted') {
      return <OfferingRequestItemActions row={row} fetch={fetch} />;
    }
    const link = offeringTeamLink(providerUuid, row.offering_uuid);
    return (
      <ActionsDropdown row={row} refetch={fetch}>
        <ActionItem
          title={translate('Default hand-on')}
          iconNode={<ArrowBendUpRightIcon weight="bold" />}
          action={() =>
            openDialog(DefaultDelegateDialog, {
              resolve: { row, refetch: fetch },
            })
          }
        />
        <ActionItem
          title={translate('Manage team')}
          iconNode={<UsersIcon weight="bold" />}
          action={() => router.stateService.go(link.state, link.params)}
        />
      </ActionsDropdown>
    );
  };
