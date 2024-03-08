import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ResourceOrdersDialog = lazyComponent(
  () => import('@waldur/marketplace/orders/list/ResourceOrdersDialog'),
  'ResourceOrdersDialog',
);

const showOrders = (resource) =>
  openModalDialog(ResourceOrdersDialog, {
    resolve: { resource },
    size: 'lg',
  });

export const ResourceOrdersLink = ({ resource }) => {
  const dispatch = useDispatch();

  return (
    <button
      type="button"
      className="text-link text-nowrap"
      onClick={() => dispatch(showOrders(resource))}
    >
      {translate('Order history')}
    </button>
  );
};
