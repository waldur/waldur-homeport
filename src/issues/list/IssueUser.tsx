import { useDispatch } from 'react-redux';

import { openUserPopover } from '@waldur/user/actions';

export const IssueUser = ({ item }) => {
  const dispatch = useDispatch();
  return (
    <a
      onClick={() => dispatch(openUserPopover({ user_uuid: item.caller_uuid }))}
    >
      {item.caller_full_name}
    </a>
  );
};
