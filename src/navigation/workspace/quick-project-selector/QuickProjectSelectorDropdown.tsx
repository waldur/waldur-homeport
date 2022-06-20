import { useState, FunctionComponent, useRef, useEffect } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import useOnScreen from '@waldur/core/useOnScreen';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { openSelectWorkspaceDialog } from '../actions';
import { getCustomersCount } from '../api';
import { EmptyOrganizationsPlaceholder } from '../EmptyOrganizationsPlaceholder';

import { OrganizationsPanel } from './OrganizationsPanel';
import { ProjectsPanel } from './ProjectsPanel';

export const QuickProjectSelectorDropdown: FunctionComponent = () => {
  const dispatch = useDispatch();
  const currentCustomer = useSelector(getCustomer);
  const [selectedOrganization, selectOrganization] =
    useState<Customer>(currentCustomer);

  const [filter, setFilter] = useState('');

  const refProjectSelector = useRef<HTMLDivElement>();
  const refSearch = useRef<HTMLInputElement>();

  const isVisible = useOnScreen(refProjectSelector);

  // Search input autofocus
  useEffect(() => {
    if (isVisible) refSearch.current.focus();
  }, [isVisible]);

  const {
    loading,
    error,
    value: organizationsCount,
  } = useAsync(getCustomersCount);

  const changeWorkspace = () => {
    dispatch(openSelectWorkspaceDialog());
  };

  return (
    <div
      ref={refProjectSelector}
      className="quick-project-selector menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-600px"
      data-kt-menu="true"
      data-popper-placement="bottom-start"
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        translate('Unable to load data')
      ) : organizationsCount === 0 ? (
        <EmptyOrganizationsPlaceholder />
      ) : (
        <>
          <div className="form-group pb-3 px-20 border-gray-300 border-bottom">
            <FormControl
              id="quick-selector-search-box"
              ref={refSearch}
              type="text"
              className="form-control-solid text-center bg-light"
              autoFocus
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder={translate('Search...')}
            />
          </div>
          <div className="d-flex border-gray-300 border-bottom">
            <OrganizationsPanel
              selectedOrganization={selectedOrganization}
              selectOrganization={selectOrganization}
              filter={filter}
            />
            <ProjectsPanel projects={selectedOrganization?.projects} />
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-decoration-underline text-dark mx-4 mt-4"
            onClick={changeWorkspace}
          >
            {translate('View all')}
          </Button>
        </>
      )}
    </div>
  );
};
