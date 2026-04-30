import { QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import {
  marketplaceProviderOfferingsUserAttributeConfigRetrieve,
  marketplaceProviderOfferingsUpdateUserAttributeConfigPartialUpdate,
  OfferingUserAttributeConfig,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { UserAttributeVisibilityTable } from '@/marketplace/user-attributes/UserAttributeVisibilityTable';

import { OfferingEditPanelProps } from './types';

const TITLE = (
  <>
    {translate('User attribute exposure')}{' '}
    <Tip
      id="user-attribute-exposure-tip"
      label={translate(
        'Configure which user profile attributes are exposed to this service provider when users are provisioned. Exposed attributes become visible in the OfferingUser API responses.',
      )}
      className="mx-2 text-muted"
    >
      <QuestionIcon size={24} weight="fill" />
    </Tip>
  </>
);

export const UserAttributeConfigSection: FC<OfferingEditPanelProps> = ({
  offering,
  refetch: refetchOffering,
}) => {
  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['offering-user-attribute-config', offering.uuid],
    queryFn: () =>
      marketplaceProviderOfferingsUserAttributeConfigRetrieve({
        path: { uuid: offering.uuid },
      }).then((response) => response.data),
    staleTime: UI_STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const update = useCallback(
    async (formData: Partial<OfferingUserAttributeConfig>) => {
      await marketplaceProviderOfferingsUpdateUserAttributeConfigPartialUpdate({
        path: { uuid: offering.uuid },
        body: formData,
      });
      await refetch();
      await refetchOffering();
    },
    [offering.uuid, refetch, refetchOffering],
  );

  return (
    <UserAttributeVisibilityTable
      title={TITLE}
      config={
        config as unknown as Record<string, boolean | undefined> | undefined
      }
      update={update}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
    />
  );
};
