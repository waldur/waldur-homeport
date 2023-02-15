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
import {
  checkIsOwner,
  getCustomer,
  getUser,
  isStaffOrSupport,
} from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { getCustomersCount } from '../api';
import { EmptyOrganizationsPlaceholder } from '../EmptyOrganizationsPlaceholder';

import { OrganizationsPanel } from './OrganizationsPanel';
import { ProjectsPanel } from './ProjectsPanel';

export const ContextSelectorDropdown: FunctionComponent = () => {
  const currentCustomer = useSelector(getCustomer);
  const currentUser = useSelector(getUser);
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

  useEffect(() => {
    MenuComponent.reinitialization();
  });

  const {
    loading,
    error,
    value: organizationsCount,
  } = useAsync(getCustomersCount);

  const { state } = useCurrentStateAndParams();
  const router = useRouter();
  const [redirectingOrg, setRedirectingOrg] = useState('');
  const [redirectingPrj, setRedirectingPrj] = useState('');

  const isCustomerPages = isChildOf('organization', state);

  const isProjectPages = isChildOf('project', state);

  const isProviderPages = isChildOf('marketplace-provider', state);

  useOnStateChanged(() => {
    MenuComponent.hideDropdowns(undefined);
  });

  const handleOrganizationSelect = useCallback(
    (customer) => {
      if (!canSeeAll && !checkIsOwner(customer, currentUser)) {
        return;
      }
      setRedirectingOrg(customer.uuid);
      if (isCustomerPages || isProviderPages) {
        router.stateService
          .go(state.name, {
            uuid: customer.uuid,
          })
          .finally(() => {
            setRedirectingOrg('');
          });
      } else {
        router.stateService
          .go('organization.dashboard', {
            uuid: customer.uuid,
          })
          .finally(() => {
            setRedirectingOrg('');
          });
      }
    },
    [
      isCustomerPages,
      isProviderPages,
      router,
      state,
      canSeeAll,
      currentUser,
      setRedirectingOrg,
    ],
  );

  const handleProjectSelect = useCallback(
    (project) => {
      setRedirectingPrj(project.uuid);
      if (isProjectPages) {
        router.stateService
          .go(state.name, {
            uuid: project.uuid,
          })
          .finally(() => {
            setRedirectingPrj('');
          });
      } else {
        router.stateService
          .go('project.dashboard', {
            uuid: project.uuid,
          })
          .finally(() => {
            setRedirectingPrj('');
          });
      }
    },
    [isProjectPages, router, state, setRedirectingPrj],
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
        className="context-selector menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold rounded-0 fs-6"
        data-kt-menu="true"
        data-popper-placement="right-start"
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          translate('Unable to load data')
        ) : organizationsCount === 0 ? (
          <EmptyOrganizationsPlaceholder />
        ) : (
          <>
            <div className="context-selector-header form-group py-4 px-20 border-bottom">
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
            <div className="list-header py-1 px-4 border-bottom">
              <span className="fw-bold fs-7 text-white">
                {translate('Organization')}
              </span>
            </div>
            <div className="d-flex border-bottom">
              <OrganizationsPanel
                active={selectedOrganization}
                onClick={handleOrganizationSelect}
                loadingUuid={redirectingOrg}
                onMouseEnter={(customer) => {
                  selectOrganization(customer);
                }}
                filter={filter}
              />
              <ProjectsPanel
                customer={selectedOrganization}
                projects={selectedOrganization?.projects}
                onSelect={handleProjectSelect}
                loadingUuid={redirectingPrj}
                switchOrganization={handleOrganizationSelect}
                filter={filter}
              />
            </div>
            <div className="d-flex">
              <Col className="d-flex flex-column" xs={5}>
                <Link
                  className="btn btn-sm btn-link text-white mx-4 mt-4 text-decoration-underline"
                  state="profile-organizations"
                  onClick={() => MenuComponent.hideDropdowns(undefined)}
                >
                  {translate('Manage organizations')}
                </Link>
                {canSeeAll && (
                  <Link
                    className="btn btn-sm btn-link text-white mx-4 mt-4"
                    state="admin.customers"
                    onClick={() => MenuComponent.hideDropdowns(undefined)}
                  >
                    {translate('View all organizations')}
                  </Link>
                )}
              </Col>
              <Col className="d-flex flex-column" xs={7}>
                <Link
                  className="btn btn-sm btn-link text-white mx-4 mt-4 text-decoration-underline"
                  state="profile-projects"
                  onClick={() => MenuComponent.hideDropdowns(undefined)}
                >
                  {translate('Manage projects')}
                </Link>
                {canSeeAll && (
                  <Link
                    className="btn btn-sm btn-link text-white mx-4 mt-4"
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
