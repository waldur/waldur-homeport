import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

import { KeysList } from './KeysList';

export const MyKeysList = () => {
  const currentUser = useSelector(getUser);
  return <KeysList user={currentUser} />;
};
