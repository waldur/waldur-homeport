import {
  useCurrentStateAndParams,
  useOnStateChanged,
  useRouter,
} from '@uirouter/react';
import {
  useState,
  FunctionComponent,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { Col, FormControl } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import useOnScreen from '@waldur/core/useOnScreen';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { isChildOf } from '@waldur/navigation/useTabs';
import { getCustomer, isStaffOrSupport } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { getCustomersCount } from '../api';
import { EmptyOrganizationsPlaceholder } from '../EmptyOrganizationsPlaceholder';

import { OrganizationsPanel } from './OrganizationsPanel';
import { ProjectsPanel } from './ProjectsPanel';
import './QuickProjectSelectorDropdown.scss';

export const QuickProjectSelectorDropdown: FunctionComponent = () => {
  const currentCustomer = useSelector(getCustomer);
  const canSeeAll = useSelector(isStaffOrSupport);
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

  useEffect(() => {
    if (isVisible && refProjectSelector.current) {
      refProjectSelector.current.style.zIndex = '1055';
    }
  }, [isVisible]);

  const {
    loading,
    error,
    value: organizationsCount,
  } = useAsync(getCustomersCount);

  const { state } = useCurrentStateAndParams();
  const router = useRouter();

  const isCustomerPages = isChildOf('organization', state);

  const isProjectPages = isChildOf('project', state);

  const isProviderPages = isChildOf('marketplace-provider', state);

  useOnStateChanged(() => {
    MenuComponent.hideDropdowns(undefined);
  });

  const handleOrganizationSelect = useCallback(
    (customer) => {
      if (isCustomerPages || isProviderPages) {
        router.stateService.go(state.name, {
          uuid: customer.uuid,
        });
      } else {
        router.stateService.go('organization.dashboard', {
          uuid: customer.uuid,
        });
      }
    },
    [isCustomerPages, isProviderPages, router, state],
  );

  const handleProjectSelect = useCallback(
    (project) => {
      if (isProjectPages) {
        router.stateService.go(state.name, {
          uuid: project.uuid,
        });
      } else {
        router.stateService.go('project.dashboard', {
          uuid: project.uuid,
        });
      }
    },
    [isProjectPages, router, state],
  );

  return (
    <>
      {isVisible &&
        ReactDOM.createPortal(
          <div className="fade modal-backdrop show" />,
          document.getElementById('kt_aside_toolbar'),
        )}
      <div
        ref={refProjectSelector}
        className="quick-project-selector menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold rounded-0 py-4 fs-6"
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
                active={selectedOrganization}
                onClick={handleOrganizationSelect}
                onMouseEnter={(customer) => {
                  selectOrganization(customer);
                }}
                filter={filter}
              />
              <ProjectsPanel
                projects={selectedOrganization?.projects}
                onSelect={handleProjectSelect}
                filter={filter}
              />
            </div>
            <div className="d-flex">
              <Col className="organization-listing d-flex flex-column" xs={5}>
                <Link
                  className="btn btn-sm btn-link text-dark mx-4 mt-4"
                  state="profile-organizations"
                  onClick={() => MenuComponent.hideDropdowns(undefined)}
                >
                  {translate('View my organizations')}
                </Link>
                {canSeeAll && (
                  <Link
                    className="btn btn-sm btn-link text-dark mx-4 mt-4"
                    state="admin.customers"
                    onClick={() => MenuComponent.hideDropdowns(undefined)}
                  >
                    {translate('View all organizations')}
                  </Link>
                )}
              </Col>
              <Col className="organization-listing d-flex flex-column" xs={7}>
                <Link
                  className="btn btn-sm btn-link text-dark mx-4 mt-4"
                  state="profile-projects"
                  onClick={() => MenuComponent.hideDropdowns(undefined)}
                >
                  {translate('View my projects')}
                </Link>
                {canSeeAll && (
                  <Link
                    className="btn btn-sm btn-link text-dark mx-4 mt-4"
                    state="admin.projects"
                    onClick={() => MenuComponent.hideDropdowns(undefined)}
                  >
                    {translate('View all projects')}
                  </Link>
                )}
              </Col>
            </div>
          </>
        )}
      </div>
    </>
  );
};
