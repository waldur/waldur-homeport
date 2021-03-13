import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

const CustomerPopover = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerPopover" */ '@waldur/customer/popover/CustomerPopover'
    ),
  'CustomerPopover',
);

export const IssueOrganization = ({ item }) => {
  const dispatch = useDispatch();
  return (
    <a
      onClick={() =>
        dispatch(
          openModalDialog(CustomerPopover, {
            resolve: { customer_uuid: item.customer_uuid },
            size: 'lg',
          }),
        )
      }
    >
      {item.customer_name}
    </a>
  );
};
