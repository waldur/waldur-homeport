import { useQuery } from '@tanstack/react-query';
import { marketplacePublicOfferingsRetrieve, Offering } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';

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
      marketplacePublicOfferingsRetrieve({
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
      subtitle={
        <ScopeSubtitle
          label={translate('Offering name')}
          name={initialOffering.name}
        />
      }
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
