import { UISref, useCurrentStateAndParams } from '@uirouter/react';
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
  const { state } = useCurrentStateAndParams();
  const customer = useSelector(getCustomer);
  return (
    <DropdownButton title={translate('Actions')} className="me-3">
      <UISref
        to={
          isDescendantOf('admin', state)
            ? 'admin.marketplace-offering-update'
            : 'marketplace-offering-update'
        }
        params={{
          offering_uuid: row.uuid,
          uuid: row.customer_uuid || customer.uuid,
        }}
      >
        <Dropdown.Item>{translate('Edit')}</Dropdown.Item>
      </UISref>
      {[ACTIVE, PAUSED].includes(row.state) && (
        <Dropdown.Item
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
      <UISref
        to="public.marketplace-public-offering"
        params={{ uuid: row.uuid }}
      >
        <Dropdown.Item>{translate('Open public page')}</Dropdown.Item>
      </UISref>
    </DropdownButton>
  );
};
