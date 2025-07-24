import { useDispatch, useSelector } from 'react-redux';

import { setCurrentUser } from './actions';
import { getUser } from './selectors';

export const useUser = () => useSelector(getUser);

export const useSetUser = () => {
  const dispatch = useDispatch();
  return (user) => dispatch(setCurrentUser(user));
};
