import { useQuery } from '@tanstack/react-query';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { DeployFormData } from '@/marketplace/common/types';
import { ORDER_FORM_ID } from '@/marketplace/details/constants';
import { PureOfferingConfiguratorProps } from '@/marketplace/details/types';
import { Offering, OfferingConfigurationFormProps } from '@/marketplace/types';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { type RootState } from '@/store/reducers';

import { DeployPage } from '../../deploy/DeployPage';
import { getDefaultLimits } from '../utils';

interface PreviewOfferingOwnProps {
  resolve: {
    offering: Offering;
  };
}

interface PreviewOfferingDialogProps
  extends OfferingConfigurationFormProps, PreviewOfferingOwnProps {}

const PurePreviewOfferingDialog = (props: PreviewOfferingDialogProps) => {
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

const storeConnector = connect<{}, {}, PreviewOfferingOwnProps, RootState>(
  (_, ownProps) => ({
    initialValues: {
      limits: getDefaultLimits(ownProps.resolve.offering),
    },
  }),
);

const formConnector = reduxForm<DeployFormData, PureOfferingConfiguratorProps>({
  form: ORDER_FORM_ID,
  touchOnChange: true,
});

const enhance = compose(storeConnector, formConnector);

export const PreviewOfferingDialog = enhance(PurePreviewOfferingDialog);
