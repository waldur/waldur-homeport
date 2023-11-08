import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { deleteProviderOffering } from '../common/api';

import { ACTIVE, PAUSED } from './store/constants';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);

export const OfferingViews = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(getUser);
  const { state } = useCurrentStateAndParams();
  const customer = useSelector(getCustomer);
  const userPermitted = hasPermission(user, {
    permission: PermissionEnum.DELETE_OFFERING,
    customerId: customer.uuid,
  });

  const handleDeleteConfirmation = () => {
    waitForConfirmation(
      dispatch,
      translate('Delete confirmation'),
      translate('Are you sure you want to delete this offering?'),
    ).then(() => {
      deleteProviderOffering(row.uuid)
        .then(() => {
          dispatch(showSuccess(translate('Offering deleted successfully.')));
        })
        .catch((error) => {
          dispatch(
            showErrorResponse(
              error.response,
              translate('Error while deleting offering.'),
            ),
          );
        });
      refetch();
    });
  };

  const redirect = (state, params) => {
    setTimeout(() => {
      router.stateService.go(state, params);
    }, 100);
  };

  return (
    <DropdownButton title={translate('Actions')} className="me-3">
      <Dropdown.Item
        as="button"
        onClick={() => {
          redirect(
            isDescendantOf('admin', state)
              ? 'admin.marketplace-offering-update'
              : 'marketplace-offering-update',
            {
              offering_uuid: row.uuid,
              uuid: row.customer_uuid || customer.uuid,
            },
          );
        }}
      >
        {translate('Edit')}
      </Dropdown.Item>
      {[ACTIVE, PAUSED].includes(row.state) && (
        <Dropdown.Item
          as="button"
          onClick={() => {
            dispatch(
              openModalDialog(PreviewOfferingDialog, {
                resolve: { offering: row },
                size: 'lg',
              }),
            );
          }}
        >
          {translate('Preview order form')}
        </Dropdown.Item>
      )}
      <Dropdown.Item
        as="button"
        onClick={() => {
          redirect('public.marketplace-public-offering', { uuid: row.uuid });
        }}
      >
        {translate('Open public page')}
      </Dropdown.Item>
      {row.state == 'Draft' && row.resources_count == 0 && userPermitted && (
        <Dropdown.Item
          as="button"
          className="text-danger"
          onClick={() => {
            handleDeleteConfirmation();
          }}
        >
          {translate('Delete')}
        </Dropdown.Item>
      )}
    </DropdownButton>
  );
};
