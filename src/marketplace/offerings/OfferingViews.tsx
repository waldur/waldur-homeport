import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getCustomer } from '@waldur/workspace/selectors';

import { ACTIVE, PAUSED } from './store/constants';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);

export const OfferingViews = ({ row }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { state } = useCurrentStateAndParams();
  const customer = useSelector(getCustomer);

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
    </DropdownButton>
  );
};
