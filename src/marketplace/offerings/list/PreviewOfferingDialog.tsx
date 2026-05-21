import { useQuery } from '@tanstack/react-query';
import { marketplaceProviderOfferingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { DeployPage } from '../../deploy/DeployPage';

interface PreviewOfferingOwnProps {
  resolve: {
    offering: Offering;
  };
}

export const PreviewOfferingDialog = (props: PreviewOfferingOwnProps) => {
  const initialOffering = props.resolve.offering;
  const shouldLoadFullOffering =
    !initialOffering.options || !initialOffering.plans;

  const {
    data: fetchedOffering,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'preview-offering',
      initialOffering.uuid,
      shouldLoadFullOffering,
    ],
    queryFn: () =>
      marketplaceProviderOfferingsRetrieve({
        path: { uuid: initialOffering.uuid },
      }).then((response) => response.data),
    enabled: shouldLoadFullOffering,
    refetchOnWindowFocus: false,
  });

  const offeringData = shouldLoadFullOffering
    ? fetchedOffering
    : initialOffering;

  return (
    <ModalDialog
      title={translate('Preview offering')}
      footer={<CloseDialogButton />}
    >
      {shouldLoadFullOffering ? (
        isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <LoadingErred loadData={refetch} />
        ) : offeringData ? (
          <DeployPage offering={offeringData} previewMode={true} />
        ) : null
      ) : (
        <DeployPage offering={offeringData} previewMode={true} />
      )}
    </ModalDialog>
  );
};
