import { useDispatch } from 'react-redux';

import { openModalDialog } from '@waldur/modal/actions';

import { CustomerPopover } from './IssueRow';

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
