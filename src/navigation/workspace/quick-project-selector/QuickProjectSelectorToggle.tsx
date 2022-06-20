import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useMedia } from 'react-use';

import { truncate } from '@waldur/core/utils';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { QuickProjectSelectorDropdown } from './QuickProjectSelectorDropdown';

const MAX_LENGTH_TITLE_DISPLAY = 12;

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
    return `${truncate(customerName, MAX_LENGTH_TITLE_DISPLAY)} > ${truncate(
      project.name,
      MAX_LENGTH_TITLE_DISPLAY,
    )}`;
  } else {
    return truncate(customerName);
  }
};

const getTitleTooltip = (isWide, customer, project) => {
  if (!customer || !project) {
    return;
  }

  const displayName = `${getOrganizationDisplayName(isWide, customer)} > ${
    project.name
  }`;

  if (displayName.length < MAX_LENGTH_TITLE_DISPLAY) return;

  return displayName;
};

export const QuickProjectSelectorToggle: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const isWide = useMedia('(min-width: 640px)');
  const title = getTitle(isWide, customer, project);
  const titleTooltip = getTitleTooltip(isWide, customer, project);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="text-nowrap min-w-125px me-4"
        data-cy="quick-project-selector-toggle"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-start"
        data-kt-menu-flip="bottom"
      >
        {wrapTooltip(
          titleTooltip,
          <span id="select-workspace-title">{title || 'N/A'}</span>,
          { placement: 'bottom' },
        )}
        <span className="svg-icon svg-icon-1 ms-2">
          <i className="fa fa-caret-down lh-base" />
        </span>
      </Button>
      <QuickProjectSelectorDropdown />
    </>
  );
};
