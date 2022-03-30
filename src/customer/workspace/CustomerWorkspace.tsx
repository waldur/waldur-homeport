import { useCurrentStateAndParams } from '@uirouter/react';
import { triggerTransition } from '@uirouter/redux';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { Layout } from '@waldur/navigation/Layout';
import { getCustomer } from '@waldur/project/api';
import {
  setCurrentCustomer,
  setCurrentProject,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import {
  checkCustomerUser,
  checkIsServiceManager,
  getCustomer as getCustomerSelector,
  getUser,
} from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

export const CustomerWorkspace: FunctionComponent = () => {
  const customer = useSelector(getCustomerSelector);
  const currentUser = useSelector(getUser);
  const { params } = useCurrentStateAndParams();
  const customerId = params?.uuid;

  const dispatch = useDispatch();
  useAsync(async () => {
    if (!customerId) {
      dispatch(triggerTransition('errorPage.notFound', {}));
    } else {
      try {
        const currentCustomer = await getCustomer(customerId);
        dispatch(setCurrentCustomer(currentCustomer));
        dispatch(setCurrentProject(null));
        dispatch(setCurrentWorkspace(ORGANIZATION_WORKSPACE));

        if (
          !checkCustomerUser(currentCustomer, currentUser) &&
          !checkIsServiceManager(currentCustomer, currentUser) &&
          !currentUser.is_support
        ) {
          dispatch(triggerTransition('errorPage.notFound', {}));
        }
      } catch {
        dispatch(triggerTransition('errorPage.notFound', {}));
      }
    }
  }, [customerId]);

  return customer ? <Layout /> : null;
};
