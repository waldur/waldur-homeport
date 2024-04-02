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
import { MenuComponent } from '@waldur/metronic/components';
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
  const { state } = useCurrentStateAndParams();
  const currentCustomer = useSelector(getCustomer);
  const currentUser = useSelector(getUser);
  const canSeeAll = useSelector(isStaffOrSupport);
  const [selectedOrganization, selectOrganization] =
    useState<Customer>(currentCustomer);

  const [filter, setFilter] = useState('');
  const [onlyServiceProviders, setOnlyServiceProviders] = useState(() =>
    isChildOf('marketplace-provider', state),
  );
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllIsVisible, setShowAllIsVisible] = useState(false);

  const refProjectSelector = useRef<HTMLDivElement>();
  const refSearch = useRef<HTMLInputElement>();

  const isVisible = useOnScreen(refProjectSelector);

  // Update the selected org if it is the same currentCustomer and the currentCustomer just updated
  useEffect(() => {
    if (selectedOrganization?.uuid === currentCustomer?.uuid) {
      selectOrganization(currentCustomer);
    }
  }, [currentCustomer, selectedOrganization, selectOrganization]);

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
    if (isVisible) {
      setOnlyServiceProviders(isChildOf('marketplace-provider', state));
    }
  }, [isVisible, state, setOnlyServiceProviders]);

  useEffect(() => {
    MenuComponent.reinitialization();
  });

  const {
    loading,
    error,
    value: organizationsCount,
  } = useAsync(getCustomersCount);

  const router = useRouter();
  const [redirectingOrg, setRedirectingOrg] = useState('');
  const [redirectingPrj, setRedirectingPrj] = useState('');

  useOnStateChanged(() => {
    MenuComponent.hideDropdowns(undefined);
  });

  const handleOrganizationSelect = useCallback(
    (customer) => {
      if (!canSeeAll && !checkIsOwner(customer, currentUser)) {
        return;
      }
      setRedirectingOrg(customer.uuid);
      router.stateService
        .go('organization.dashboard', {
          uuid: customer.uuid,
        })
        .finally(() => {
          setRedirectingOrg('');
        });
    },
    [router, canSeeAll, currentUser, setRedirectingOrg],
  );

  const handleProjectSelect = useCallback(
    (project) => {
      setRedirectingPrj(project.uuid);
      router.stateService
        .go('project.dashboard', {
          uuid: project.uuid,
        })
        .finally(() => {
          setRedirectingPrj('');
        });
    },
    [router, setRedirectingPrj],
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
        ) : isVisible ? (
          <>
            <div className="context-selector-header form-group border-bottom">
              <button
                className="button-close btn btn-icon btn-icon-white p-2 me-2"
                onClick={() => {
                  MenuComponent.hideDropdowns(undefined);
                }}
              >
                <i className="fa fa-arrow-left fs-4"></i>
              </button>
              <FormControl
                id="quick-selector-search-box"
                ref={refSearch}
                type="text"
                className="form-control-solid text-center bg-light"
                autoFocus
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setShowAllIsVisible(event.target.value !== '');
                }}
                placeholder={translate('Search...')}
              />
            </div>
            <div className="list-header py-1 px-4 border-bottom">
              <div className="row">
                <Col md={12} lg={5} className="d-flex justify-content-between">
                  <span className="fw-bold fs-7 text-white">
                    {translate('Organization')}
                  </span>
                  <div className="form-check form-switch form-check-custom form-check-solid">
                    <input
                      className="form-check-input h-20px w-30px"
                      type="checkbox"
                      value=""
                      id="contextSelectorOnlySP"
                      checked={onlyServiceProviders}
                      onChange={() => {
                        setOnlyServiceProviders((prev) => !prev);
                      }}
                    />
                    <label
                      className="form-check-label text-white"
                      htmlFor="contextSelectorOnlySP"
                    >
                      {translate('Only service providers')}
                    </label>
                  </div>
                </Col>
                {showAllIsVisible && (
                  <Col md={12} lg={5} className="d-flex justify-content-end">
                    <div className="form-check form-switch form-check-custom form-check-solid">
                      <input
                        className="form-check-input h-20px w-30px"
                        type="checkbox"
                        value=""
                        id="contextSelectorAllProjects"
                        checked={showAllProjects}
                        onChange={() => {
                          setShowAllProjects((prev) => !prev);
                        }}
                      />
                      <label
                        className="form-check-label text-white"
                        htmlFor="contextSelectorAllProjects"
                      >
                        {translate('Show all projects of organization')}
                      </label>
                    </div>
                  </Col>
                )}
              </div>
            </div>
            <div className="d-flex border-bottom">
              <OrganizationsPanel
                active={selectedOrganization}
                selected={currentCustomer}
                onClick={handleOrganizationSelect}
                loadingUuid={redirectingOrg}
                onMouseEnter={(customer) => {
                  selectOrganization(customer);
                }}
                filter={filter}
                isServiceProvider={onlyServiceProviders}
                showAllProjects={showAllProjects}
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
              <Col className="d-flex flex-column justify-content-center" xs={5}>
                <Link
                  className="btn btn-sm btn-link text-white text-decoration-underline my-3"
                  state="profile-organizations"
                  onClick={() => MenuComponent.hideDropdowns(undefined)}
                >
                  {translate('Manage organizations')}
                </Link>
              </Col>
              <Col className="d-flex flex-column justify-content-center" xs={7}>
                <Link
                  className="btn btn-sm btn-link text-white text-decoration-underline my-3"
                  state="profile-projects"
                  onClick={() => MenuComponent.hideDropdowns(undefined)}
                >
                  {translate('Manage projects')}
                </Link>
              </Col>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};
