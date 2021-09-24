import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { UpdateServiceProviderDescriptionDialog } from '@waldur/marketplace/offerings/service-providers/UpdateServiceProviderDescriptionDialog';
import { ServiceProvider } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import './ServiceProviderDescriptionUpdateButton.scss';

const openUpdateServiceProviderDescriptionDialog = (
  serviceProvider: ServiceProvider,
) =>
  openModalDialog(UpdateServiceProviderDescriptionDialog, {
    resolve: {
      serviceProvider,
    },
  });

interface ServiceProviderDescriptionUpdateButtonProps {
  serviceProvider: ServiceProvider;
}

export const ServiceProviderDescriptionUpdateButton: FunctionComponent<ServiceProviderDescriptionUpdateButtonProps> = ({
  serviceProvider,
}) => {
  const dispatch = useDispatch();
  return (
    <button
      type="button"
      className="btn btn-default btn-card providerDescUpdateBtn m-t-sm"
      onClick={() =>
        dispatch(openUpdateServiceProviderDescriptionDialog(serviceProvider))
      }
    >
      {translate('Update')}
    </button>
  );
};
