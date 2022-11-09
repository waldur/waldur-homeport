import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ResourceOrderItemsDialog = lazyComponent(
  () => import('@waldur/marketplace/orders/item/list/ResourceOrderItemsDialog'),
  'ResourceOrderItemsDialog',
);

const showOrderItems = (resource) =>
  openModalDialog(ResourceOrderItemsDialog, {
    resolve: { resource },
    size: 'lg',
  });

export const ResourceOrderItemsLink = ({ resource }) => {
  const dispatch = useDispatch();

  return (
    <a
      className="cursor-pointer text-dark text-decoration-underline text-hover-primary"
      onClick={() => dispatch(showOrderItems(resource))}
    >
      {translate('Order history')}
    </a>
  );
};
