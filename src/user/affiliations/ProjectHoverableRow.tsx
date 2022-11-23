import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/project/api';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';
import {
  getCustomer as getCustomerSelector,
  getProject as getProjectSelector,
} from '@waldur/workspace/selectors';

export const ProjectHoverableRow = ({ row }) => {
  const currentProject = useSelector(getProjectSelector);
  const currentCustomer = useSelector(getCustomerSelector);
  const dispatch = useDispatch();

  const [{ loading }, select] = useAsyncFn(async () => {
    if (!row.customer_uuid) return;
    const isSameCustomer =
      currentCustomer && row.customer_uuid === currentCustomer.uuid;
    const promises: Promise<any>[] = [getProject(row.project_uuid)];
    if (!isSameCustomer) {
      promises.push(getCustomer(row.customer_uuid));
    }
    const data = await Promise.all(promises);
    const newProject = data[0];
    let newCustomer;
    if (!isSameCustomer) {
      newCustomer = data[1];
    }

    newCustomer && dispatch(setCurrentCustomer(newCustomer));
    dispatch(setCurrentProject(newProject));
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return currentProject?.uuid !== row.project_uuid ? (
    <Button
      variant="light"
      className="btn-active-primary min-w-90px pull-right"
      size="sm"
      onClick={() => select()}
    >
      {translate('Select')}
    </Button>
  ) : (
    <Button
      variant="secondary"
      size="sm"
      disabled={true}
      className="pull-right"
    >
      {translate('Selected')}
    </Button>
  );
};
