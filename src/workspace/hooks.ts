import { useDispatch, useSelector } from 'react-redux';

import { setCurrentUser } from './actions';
import { getCustomer, getProject, getUser } from './selectors';

export const useUser = () => useSelector(getUser);

export const useCustomer = () => useSelector(getCustomer);

export const useProject = () => useSelector(getProject);

export const useSetUser = () => {
  const dispatch = useDispatch();
  return (user) => dispatch(setCurrentUser(user));
};
