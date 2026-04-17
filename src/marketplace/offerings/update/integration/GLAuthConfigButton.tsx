import { EyeIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsGlauthUsersConfigRetrieve } from 'waldur-js-client';

import { STALE_TIME } from '@waldur/core/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
  const { data, error, isLoading, refetch } = useQuery({
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

  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(GLAuthConfigDialog, {
        resolve: { offering, config: data },
        size: 'lg',
      }),
    );
  };
  return error ? (
    <LoadingErred loadData={refetch} />
  ) : (
    <ActionButton
      action={callback}
      title={translate('View GLAuth configuration')}
      iconNode={enabled && data && <EyeIcon weight="bold" />}
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
