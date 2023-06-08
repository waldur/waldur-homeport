import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { SearchIcon } from '@waldur/core/svg/SearchIcon';
import useOnScreen from '@waldur/core/useOnScreen';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { isChildOf } from '@waldur/navigation/useTabs';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { ProjectCreateButton } from '@waldur/project/ProjectCreateButton';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { ProjectsList } from './ProjectsList';

export const ProjectSelectorDropdown: FunctionComponent = () => {
  const project = useSelector(getProject);
  const currentCustomer = useSelector(getCustomer);

  const [filter, setFilter] = useState('');

  const filteredProjects = useMemo(() => {
    if (!filter.trim() || !currentCustomer?.projects?.length) {
      return currentCustomer?.projects || [];
    }
    return currentCustomer.projects.filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [filter, currentCustomer]);

  const abbreviation = useMemo(
    () => (project ? getItemAbbreviation(project) : null),
    [project],
  );

  const refProjectSelector = useRef<HTMLDivElement>();
  const refSearch = useRef<HTMLInputElement>();
  const isVisible = useOnScreen(refProjectSelector);

  // Search input autofocus
  useEffect(() => {
    if (isVisible && refSearch.current) refSearch.current.focus();
  }, [isVisible]);

  const { state } = useCurrentStateAndParams();
  const router = useRouter();
  const isProjectPages = isChildOf('project', state);
  const [redirecting, setRedirecting] = useState('');

  const handleProjectSelect = useCallback(
    (project) => {
      setRedirecting(project.uuid);
      if (isProjectPages) {
        router.stateService
          .go(state.name, {
            uuid: project.uuid,
          })
          .finally(() => setRedirecting(''));
      } else {
        router.stateService
          .go('project.dashboard', {
            uuid: project.uuid,
          })
          .finally(() => setRedirecting(''));
      }
    },
    [isProjectPages, router, state, setRedirecting],
  );

  return (
    <div className="project-selector-wrapper">
      {/* Toggle */}
      <div
        className="project-selector-toggle btn btn-active-light d-flex align-items-center bg-hover-light py-2 px-2 px-md-3"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
      >
        <div className="cursor-pointer symbol symbol-30px symbol-md-40px">
          {project?.image ? (
            <Image src={project?.image} size={40} />
          ) : (
            <ImagePlaceholder width="40px" height="40px">
              {abbreviation && (
                <div className="symbol-label fs-6 fw-bold">{abbreviation}</div>
              )}
            </ImagePlaceholder>
          )}
        </div>
        <span className="text-dark d-none d-sm-block fs-base fw-bold lh-1 mx-3">
          {project ? project.name : translate('Select project')}
        </span>
        <i className="fa fa-caret-down fs-4 text-dark"></i>
      </div>
      {/* END: Toggle */}

      <div
        ref={refProjectSelector}
        className="project-selector-dropdown menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold rounded-0 fs-6"
        data-kt-menu="true"
      >
        <form
          className="w-100 d-flex align-items-center px-5 py-1 border"
          autoComplete="off"
        >
          <span className="svg-icon svg-icon-2 svg-icon-lg-1 svg-icon-dark">
            <SearchIcon />
          </span>
          <input
            ref={refSearch}
            type="text"
            className="form-control form-control-flush"
            name="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={translate('Find project') + '...'}
            autoComplete="off"
          />
          <i className="fa fa-caret-down fs-4 text-dark"></i>
        </form>
        <ProjectsList
          projects={filteredProjects}
          onSelect={handleProjectSelect}
          filter={filter}
          loadingUuid={redirecting}
        />
        <Row className="bg-light border g-0">
          <Col xs={5}>
            <ProjectCreateButton
              title={translate('New project')}
              variant="link"
              className="btn-lg text-dark pl-2 text-left w-100 text-decoration-underline"
              icon={null}
            />
          </Col>
          <Col xs={7}>
            <Link
              className="btn btn-lg text-right pr-2 btn-link text-dark w-100 text-decoration-underline"
              state="profile-organizations"
              onClick={() => MenuComponent.hideDropdowns(undefined)}
            >
              {translate('Change organization')}
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};
