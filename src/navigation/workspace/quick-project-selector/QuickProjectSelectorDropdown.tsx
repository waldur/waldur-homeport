import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo, useState, FunctionComponent, useRef, useEffect } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import useOnScreen from '@waldur/core/useOnScreen';
import { getCustomerItems } from '@waldur/customer/utils';
import { translate } from '@waldur/i18n';
import { getProjectItems, getProviderItems } from '@waldur/navigation/navitems';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { openSelectWorkspaceDialog } from '../actions';
import { getCustomersCount } from '../api';
import { EmptyOrganizationsPlaceholder } from '../EmptyOrganizationsPlaceholder';

import { OrganizationsPanel } from './OrganizationsPanel';
import { ProjectsPanel } from './ProjectsPanel';

require('./QuickProjectSelectorDropdown.scss');

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
    if (isVisible && refSearch.current) refSearch.current.focus();
  }, [isVisible]);

  const router = useRouter();
  const { state } = useCurrentStateAndParams();

  const isCustomer = useMemo(
    () =>
      getCustomerItems()
        .map((item) => item.to)
        .includes(state.name),
    [state.name],
  );

  const isProject = useMemo(
    () =>
      getProjectItems()
        .map((item) => item.to)
        .includes(state.name),
    [state.name],
  );

  const isProvider = useMemo(
    () =>
      getProviderItems()
        .map((item) => item.to)
        .includes(state.name),
    [state.name],
  );

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
            {!isProject && (
              <OrganizationsPanel
                selectedOrganization={selectedOrganization}
                onClick={(item) => {
                  if (isCustomer || isProvider) {
                    router.stateService.go('organization.dashboard', {
                      uuid: item.uuid,
                    });
                  } else {
                    selectOrganization(item);
                  }
                }}
                onMouseEnter={selectOrganization}
                filter={filter}
              />
            )}
            {!isProvider && (
              <ProjectsPanel projects={selectedOrganization?.projects} />
            )}
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
