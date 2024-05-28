import {
  Buildings,
  ClipboardText,
  SquaresFour,
  Star,
} from '@phosphor-icons/react';
import { groupBy, isEmpty } from 'lodash';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Col, Nav, Row, Tab } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { FavoritePageService } from '../favorite-pages/FavoritePageService';

import { NoResult } from './NoResult';
import { SearchFilters } from './SearchFilters';
import { SearchInput } from './SearchInput';
import { SearchItem } from './SearchItem';
import { SearchResult } from './useSearch';

interface SearchPopoverProps {
  result: SearchResult;
  query: string;
  show: boolean;
  setQuery;
}

interface TabContentProps {
  result: SearchResult;
  clearSearch(): void;
}

const recentItems = [
  {
    uuid: '1',
    title: 'Item #1',
    menu: 'organization',
  },
  {
    uuid: '2',
    title: 'Item #2',
    menu: 'project',
  },
  {
    uuid: '3',
    title: 'Item #3',
    menu: 'resource',
  },
];

const SectionTitle = ({ title, className = '' }) => (
  <h6
    className={
      'text-gray-700 fw-bold mb-3 mx-5' + (className ? ` ${className}` : '')
    }
  >
    {title}
  </h6>
);

const SectionNoResult = () => (
  <p className="text-muted mb-5 mx-5">{translate('No result found')}</p>
);

const AllResultsTabContent = ({ result, clearSearch }: TabContentProps) => {
  const getFavPagesList = () => FavoritePageService.list().reverse();
  const [favPages] = useState(() => getFavPagesList().slice(0, 3));

  return (
    <Row className="mx-0">
      <Col md={12} lg={6} className="py-5 px-0">
        <div className="mb-3">
          <SectionTitle title={translate('Recent')} />
          {recentItems.map((item) => (
            <div
              key={item.uuid}
              className="d-flex text-dark text-hover-primary align-items-center py-2 px-5 bg-hover-primary-50"
            >
              {item.menu === 'organization' ? (
                <Buildings
                  size={22}
                  weight="bold"
                  className="text-gray-700 me-4"
                />
              ) : item.menu === 'project' ? (
                <ClipboardText
                  size={22}
                  weight="bold"
                  className="text-gray-700 me-4"
                />
              ) : (
                <SquaresFour
                  size={22}
                  weight="bold"
                  className="text-gray-700 me-4"
                />
              )}
              <span className="fs-6 fw-semibold">{item.title}</span>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <SectionTitle title={translate('Favourites')} />
          {favPages.length > 0 ? (
            favPages.map((page) => (
              <SearchItem
                key={page.id}
                to={page.state}
                params={page.params}
                title={page.title}
                subtitle={page.subtitle}
                image={page.image}
                badge={
                  <Star size={20} weight="fill" className="text-warning" />
                }
              />
            ))
          ) : (
            <SectionNoResult />
          )}
        </div>
      </Col>
      <Col md={12} lg={6} className="bg-gray-50 pb-5 px-0">
        {result.data?.resultsCount ? (
          <>
            <div className="mb-3 mt-5">
              <SectionTitle title={translate('Organizations')} />
              {result.data?.customersCount ? (
                result.data.customers
                  .slice(0, 3)
                  .map((item) => (
                    <SearchItem
                      key={item.uuid}
                      to="organization.dashboard"
                      params={{ uuid: item.uuid }}
                      title={item.name}
                      image={item.image}
                    />
                  ))
              ) : (
                <SectionNoResult />
              )}
            </div>
            <div className="mb-3">
              <SectionTitle title={translate('Projects')} />
              {result.data?.projectsCount ? (
                result.data.projects
                  .slice(0, 3)
                  .map((item) => (
                    <SearchItem
                      key={item.uuid}
                      to="project.dashboard"
                      params={{ uuid: item.uuid }}
                      title={item.name}
                      subtitle={item.customer_name}
                      image={item.image}
                    />
                  ))
              ) : (
                <SectionNoResult />
              )}
            </div>
            <div>
              <SectionTitle title={translate('Resources')} />
              {result.data?.resourcesCount ? (
                result.data.resources
                  .slice(0, 3)
                  .map((resource, resourceIndex) => (
                    <SearchItem
                      key={resourceIndex}
                      to="marketplace-resource-details"
                      params={{
                        resource_uuid: resource.uuid,
                      }}
                      image={resource.offering_thumbnail}
                      title={resource.name}
                      subtitle={`${resource.customer_name} / ${resource.project_name}`}
                    />
                  ))
              ) : (
                <SectionNoResult />
              )}
            </div>
          </>
        ) : null}
        <NoResult
          isVisible={!result.data?.resultsCount && result.status !== 'loading'}
          callback={clearSearch}
        />
      </Col>
    </Row>
  );
};

const OrganizationsTabContent = ({ result, clearSearch }: TabContentProps) => {
  return (
    <>
      {result.data?.customersCount ? (
        <div className="py-5">
          {result.data.customers.map((item) => (
            <SearchItem
              key={item.uuid}
              to="organization.dashboard"
              params={{ uuid: item.uuid }}
              title={item.name}
              image={item.image}
            />
          ))}
        </div>
      ) : null}
      <NoResult
        isVisible={
          isEmpty(result.data?.customers) && result.status !== 'loading'
        }
        callback={clearSearch}
      />
    </>
  );
};

const ProjectsTabContent = ({ result, clearSearch }: TabContentProps) => {
  return (
    <>
      {result.data?.projectsCount ? (
        <div className="py-5">
          {result.data.projects.map((item) => (
            <SearchItem
              key={item.uuid}
              to="project.dashboard"
              params={{ uuid: item.uuid }}
              title={item.name}
              subtitle={item.customer_name}
              image={item.image}
            />
          ))}
        </div>
      ) : null}
      <NoResult
        isVisible={
          isEmpty(result.data?.projects) && result.status !== 'loading'
        }
        callback={clearSearch}
      />
    </>
  );
};

const ResourcesTabContent = ({ result, clearSearch }: TabContentProps) => {
  const resourceGroups = result.data?.resources
    ? groupBy(result.data.resources, 'category_title')
    : null;
  return (
    <>
      {!isEmpty(resourceGroups) ? (
        <div className="py-5">
          {Object.keys(resourceGroups).map((item, categoryIndex) => (
            <Fragment key={categoryIndex}>
              <SectionTitle title={item} className="mt-3" />
              {resourceGroups[item].map((resource, resourceIndex) => (
                <SearchItem
                  key={resourceIndex}
                  to="marketplace-resource-details"
                  params={{
                    resource_uuid: resource.uuid,
                  }}
                  image={resource.offering_thumbnail}
                  title={resource.name}
                  subtitle={`${resource.customer_name} / ${resource.project_name}`}
                />
              ))}
            </Fragment>
          ))}
        </div>
      ) : null}
      <NoResult
        isVisible={isEmpty(resourceGroups) && result.status !== 'loading'}
        callback={clearSearch}
      />
    </>
  );
};

export const SearchPopover = ({
  result,
  query,
  show,
  setQuery,
}: SearchPopoverProps) => {
  const [menuState, setMenuState] = useState<'main' | 'advanced'>('main');

  const refSearch = useRef<HTMLInputElement>();
  useEffect(() => {
    if (refSearch.current) {
      refSearch.current.focus();
    }
  }, []);

  const doSearch = () => {
    setMenuState('main');
    result.refetch();
  };

  const clearSearch = useCallback(() => {
    setQuery('');
  }, [setQuery]);

  return (
    <div className="pt-5">
      <div className={`${menuState === 'main' ? '' : 'd-none'}`}>
        <SearchInput
          result={result}
          query={query}
          show={show}
          setQuery={setQuery}
          className="px-5 mb-6 d-lg-none"
        />
        <Tab.Container id="left-tabs-example" defaultActiveKey="all">
          <div className="overflow-auto">
            <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
              <Nav.Item className="text-nowrap ms-5">
                <Nav.Link eventKey="all">
                  {translate('All results')}
                  {Boolean(result.data) && (
                    <Badge bg={null} className="badge-pill ms-2">
                      {result.data.resultsCount}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="text-nowrap">
                <Nav.Link eventKey="organizations">
                  {translate('Organizations')}
                  {Boolean(result.data) && (
                    <Badge bg={null} className="badge-pill ms-2">
                      {result.data.customersCount}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="text-nowrap">
                <Nav.Link eventKey="projects">
                  {translate('Projects')}
                  {Boolean(result.data) && (
                    <Badge bg={null} className="badge-pill ms-2">
                      {result.data.projectsCount}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="text-nowrap me-5">
                <Nav.Link eventKey="resources">
                  {translate('Resources')}
                  {Boolean(result.data) && (
                    <Badge bg={null} className="badge-pill ms-2">
                      {result.data.resourcesCount}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
          <Tab.Content className="overflow-auto min-h-200px">
            <Tab.Pane eventKey="all">
              <AllResultsTabContent result={result} clearSearch={clearSearch} />
            </Tab.Pane>
            <Tab.Pane eventKey="organizations">
              <OrganizationsTabContent
                result={result}
                clearSearch={clearSearch}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="projects">
              <ProjectsTabContent result={result} clearSearch={clearSearch} />
            </Tab.Pane>
            <Tab.Pane eventKey="resources">
              <ResourcesTabContent result={result} clearSearch={clearSearch} />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>

      <form className={`pt-1 ${menuState === 'advanced' ? '' : 'd-none'}`}>
        <h3 className="fw-bold text-dark mb-7">
          {translate('Advanced Search')}
        </h3>

        <SearchFilters />

        <div className="d-flex justify-content-end">
          <Button
            variant="light"
            size="sm"
            onClick={() => {
              setMenuState('main');
            }}
            className="fw-bolder btn-active-light-primary me-2"
          >
            {translate('Cancel')}
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="fw-bolder"
            onClick={doSearch}
          >
            {translate('Search')}
          </Button>
        </div>
      </form>
    </div>
  );
};
