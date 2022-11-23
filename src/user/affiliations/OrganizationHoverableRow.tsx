import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { getFirst } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/project/api';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';
import { getCustomer as getCustomerSelector } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

export const OrganizationHoverableRow: FC<{ row }> = ({ row }) => {
  const dispatch = useDispatch();
  const currentOrganization = useSelector(getCustomerSelector);

  const [{ loading }, select] = useAsyncFn(async () => {
    const [newCustomer, newProject] = await Promise.all([
      getCustomer(row.customer_uuid),
      getFirst<Project>('/projects/', {
        customer: row.customer_uuid,
        page_size: 1,
      }),
    ]);
    dispatch(setCurrentCustomer(newCustomer));
    dispatch(setCurrentProject(newProject));
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return currentOrganization?.uuid !== row.customer_uuid ? (
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
