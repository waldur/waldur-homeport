import { useRouter } from '@uirouter/react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { OfferingImportDialog } from './actions/OfferingImportDialog';

export const useOfferingDropdownActions = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const ownerOrStaff = useSelector(isOwnerOrStaff);
  const showOfferingListActions =
    customer && customer.is_service_provider && ownerOrStaff;

  if (!showOfferingListActions) {
    return [];
  }

  return [
    {
      label: translate('Add offerings'),
      icon: 'fa fa-plus',
      action: () => {
        router.stateService.go('marketplace-offering-create');
      },
    },
    {
      label: translate('Import offerings'),
      icon: 'fa fa-plus',
      action: () => {
        dispatch(openModalDialog(OfferingImportDialog, { size: 'lg' }));
      },
    },
    {
      label: translate('Public list'),
      icon: 'fa fa-external-link',
      action: () => {
        router.stateService.go('marketplace-service-provider.details', {
          uuid: customer.uuid,
        });
      },
    },
  ];
};
