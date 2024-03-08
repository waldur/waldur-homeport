import { UISref } from '@uirouter/react';
import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

export const UserDetailsLink = ({ uuid, name }) => {
  const currentUser = useSelector(getUser);
  if (currentUser.is_staff || currentUser.is_support) {
    return (
      <UISref to="users.details" params={{ uuid }}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a>{name}</a>
      </UISref>
    );
  } else {
    return name || 'N/A';
  }
};
