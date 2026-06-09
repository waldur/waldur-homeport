import { EyeIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  marketplaceProviderOfferingsGlauthTreeRetrieve,
  marketplaceProviderOfferingsGlauthUsersConfigRetrieve,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const GLAuthConfigDialog = lazyComponent(() =>
  import('./GLAuthConfigDialog').then((module) => ({
    default: module.GLAuthConfigDialog,
  })),
);

export const GLAuthConfigButton: FC<{
  offering;
}> = ({ offering }) => {
  const enabled =
    offering.plugin_options?.service_provider_can_create_offering_user;
  const configQuery = useQuery({
    queryKey: ['OfferingGLAuthConfig', offering.uuid, enabled],
    queryFn: () =>
      enabled
        ? marketplaceProviderOfferingsGlauthUsersConfigRetrieve({
            path: { uuid: offering.uuid },
            parseAs: 'text',
            headers: {
              Accept: 'text/plain',
            },
          }).then((response) => response.data)
        : null,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
  const treeQuery = useQuery({
    queryKey: ['OfferingGLAuthTree', offering.uuid, enabled],
    queryFn: () =>
      enabled
        ? marketplaceProviderOfferingsGlauthTreeRetrieve({
            path: { uuid: offering.uuid },
          }).then((response) => response.data ?? null)
        : null,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const { openDialog } = useModal();
  const callback = () => {
    openDialog(GLAuthConfigDialog, {
      resolve: {
        offering,
        config: configQuery.data,
        tree: treeQuery.data,
      },
      size: 'lg',
    });
  };
  const isLoading = configQuery.isLoading || treeQuery.isLoading;
  const error = configQuery.error || treeQuery.error;
  const refetch = () => {
    configQuery.refetch();
    treeQuery.refetch();
  };
  const ready = configQuery.data && treeQuery.data;
  return error ? (
    <LoadingErred loadData={refetch} />
  ) : (
    <ActionButton
      action={callback}
      title={translate('View GLAuth configuration')}
      iconNode={enabled && ready && <EyeIcon weight="bold" />}
      pending={isLoading}
      disabled={!enabled}
      tooltip={
        !enabled &&
        translate(
          '"Enable automatic creation of offering users" must be enabled for GLAuth generation',
        )
      }
    />
  );
};
