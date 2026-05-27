import { useDispatch, useSelector } from 'react-redux';

import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentUser,
} from './actions';
import { getCustomer, getProject, getUser } from './selectors';

export const useUser = () => useSelector(getUser);

export const useCustomer = () => useSelector(getCustomer);

export const useProject = () => useSelector(getProject);

export const useSetUser = () => {
  const dispatch = useDispatch();
  return (user) => dispatch(setCurrentUser(user));
};

export const useSetCustomer = () => {
  const dispatch = useDispatch();
  return (customer) => dispatch(setCurrentCustomer(customer));
};

export const useSetProject = () => {
  const dispatch = useDispatch();
  return (project) => dispatch(setCurrentProject(project));
};
