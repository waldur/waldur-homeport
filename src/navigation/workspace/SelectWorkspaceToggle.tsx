import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useMedia } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import './SelectWorkspaceToggle.scss';

const SelectWorkspaceDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SelectWorkspaceDialog" */ './SelectWorkspaceDialog'
    ),
  'SelectWorkspaceDialog',
);

const getOrganizationDisplayName = (isWide, organization) => {
  return !isWide && organization.abbreviation
    ? organization.abbreviation
    : organization.display_name || '';
};

const getTitle = (isWide, customer, project) => {
  if (!customer) {
    return '';
  }
  const customerName = getOrganizationDisplayName(isWide, customer);
  if (project) {
    return `${truncate(customerName)} > ${truncate(project.name)}`;
  } else {
    return truncate(customerName);
  }
};

const getTitleTooltip = (isWide, customer, project) => {
  if (!customer) {
    return;
  }
  if (customer.display_name.length < 30) {
    return;
  }
  const customerName = customer && getOrganizationDisplayName(isWide, customer);
  if (project) {
    return `${customerName} > ${project.name}`;
  } else {
    return customerName;
  }
};

export const SelectWorkspaceToggle: FunctionComponent = () => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const isWide = useMedia('(min-width: 640px)');
  const title = getTitle(isWide, customer, project);
  const titleTooltip = getTitleTooltip(isWide, customer, project);
  const changeWorkspace = () => {
    dispatch(
      openModalDialog(SelectWorkspaceDialog, {
        size: 'xl',
        dialogClassName: 'modal-metro modal-1000',
      }),
    );
  };
  return (
    <Button
      variant="secondary"
      size="sm"
      className="fw-bolder text-dark"
      onClick={changeWorkspace}
      data-cy="select-workspace-toggle"
    >
      {wrapTooltip(titleTooltip, title || translate('Select project'), {
        placement: 'bottom',
      })}{' '}
      <i className="fa fa-caret-down" />
    </Button>
  );
};
