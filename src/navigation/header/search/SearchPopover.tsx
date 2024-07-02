import {
  ArrowClockwise,
  Buildings,
  ClipboardText,
  Plus,
  SquaresFour,
} from '@phosphor-icons/react';
import { groupBy, isEmpty } from 'lodash';
import { Fragment, useCallback, useEffect, useRef } from 'react';
import { Badge, Button, Col, Nav, Row, Tab } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { useFavoritePages } from '../favorite-pages/FavoritePageService';

import { NoResult } from './NoResult';
import { useRecentSearch } from './RecentSearchService';
import { SearchInput } from './SearchInput';
import { SearchItem } from './SearchItem';
import { SearchResult } from './useSearch';

interface SearchPopoverProps {
  result: SearchResult;
  query: string;
  show: boolean;
  setQuery;
  close(): void;
}

interface TabContentProps
  extends Partial<ReturnType<typeof useFavoritePages>>,
    Partial<ReturnType<typeof useRecentSearch>> {
  result: SearchResult;
  clearSearch(): void;
  close(): void;
}

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

const AllResultsTabContent = ({
  result,
  clearSearch,
  favPages,
  addCurrentPageFavorite,
  isCurrentPageFavorite,
  addFavoritePage,
  removeFavorite,
  isFavorite,
  recentSearchItems,
  addRecentSearch,
  close,
}: TabContentProps) => {
  return (
    <Row className="mx-0">
      <Col md={12} lg={6} className="py-5 px-0">
        {Boolean(recentSearchItems?.length) && (
          <div className="mb-3">
            <SectionTitle title={translate('Recent')} />
            {recentSearchItems.map((item) => (
              <Link
                key={item.id}
                className="d-flex text-dark text-hover-primary align-items-center py-2 px-5 bg-hover-primary-50"
                state={item.state}
                params={item.params}
                onClick={close}
              >
                {item.type === 'organization' ? (
                  <Buildings
                    size={22}
                    weight="bold"
                    className="text-gray-700 me-4"
                  />
                ) : item.type === 'project' ? (
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
                <span className="fs-6 fw-semibold flex-grow-1">
                  {item.title}
                </span>
                <ArrowClockwise size={20} className="text-dark" />
              </Link>
            ))}
          </div>
        )}
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
                isFavorite={isFavorite} // always true
                removeFavorite={removeFavorite}
                onClick={close}
              />
            ))
          ) : (
            <SectionNoResult />
          )}
          {!isCurrentPageFavorite && (
            <Button
              variant="link"
              className="d-flex ms-8"
              onClick={addCurrentPageFavorite}
            >
              <span className="svg-icon svg-icon-2">
                <Plus />
              </span>
              {translate('Add current page')}
            </Button>
          )}
        </div>
      </Col>
      <Col md={12} lg={6} className="bg-gray-50 pb-5 px-0">
        {result.data?.resultsCount ? (
          <>
            <div className="mb-3 mt-5">
              <SectionTitle title={translate('Organizations')} />
              {result.data?.customersCount ? (
                result.data.customers.slice(0, 3).map((item) => (
                  <SearchItem
                    key={item.uuid}
                    to="organization.dashboard"
                    params={{ uuid: item.uuid }}
                    title={item.name}
                    image={item.image}
                    isFavorite={isFavorite}
                    addFavoritePage={addFavoritePage}
                    removeFavorite={removeFavorite}
                    onClick={(item) => {
                      addRecentSearch(item, 'organization');
                      close();
                    }}
                  />
                ))
              ) : (
                <SectionNoResult />
              )}
            </div>
            <div className="mb-3">
              <SectionTitle title={translate('Projects')} />
              {result.data?.projectsCount ? (
                result.data.projects.slice(0, 3).map((item) => (
                  <SearchItem
                    key={item.uuid}
                    to="project.dashboard"
                    params={{ uuid: item.uuid }}
                    title={item.name}
                    subtitle={item.customer_name}
                    image={item.image}
                    isFavorite={isFavorite}
                    addFavoritePage={addFavoritePage}
                    removeFavorite={removeFavorite}
                    onClick={(item) => {
                      addRecentSearch(item, 'project');
                      close();
                    }}
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
                      isFavorite={isFavorite}
                      addFavoritePage={addFavoritePage}
                      removeFavorite={removeFavorite}
                      onClick={(item) => {
                        addRecentSearch(item, 'resource');
                        close();
                      }}
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

const OrganizationsTabContent = ({
  result,
  clearSearch,
  isFavorite,
  addFavoritePage,
  removeFavorite,
  addRecentSearch,
  close,
}: TabContentProps) => {
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
              isFavorite={isFavorite}
              addFavoritePage={addFavoritePage}
              removeFavorite={removeFavorite}
              onClick={(item) => {
                addRecentSearch(item, 'organization');
                close();
              }}
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

const ProjectsTabContent = ({
  result,
  clearSearch,
  isFavorite,
  addFavoritePage,
  removeFavorite,
  addRecentSearch,
  close,
}: TabContentProps) => {
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
              isFavorite={isFavorite}
              addFavoritePage={addFavoritePage}
              removeFavorite={removeFavorite}
              onClick={(item) => {
                addRecentSearch(item, 'project');
                close();
              }}
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

const ResourcesTabContent = ({
  result,
  clearSearch,
  isFavorite,
  addFavoritePage,
  removeFavorite,
  addRecentSearch,
  close,
}: TabContentProps) => {
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
                  isFavorite={isFavorite}
                  addFavoritePage={addFavoritePage}
                  removeFavorite={removeFavorite}
                  onClick={(item) => {
                    addRecentSearch(item, 'resource');
                    close();
                  }}
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
  close,
}: SearchPopoverProps) => {
  const {
    favPages,
    isCurrentPageFavorite,
    addCurrentPageFavorite,
    addFavoritePage,
    removeFavorite,
    isFavorite,
  } = useFavoritePages();
  const refSearch = useRef<HTMLInputElement>();
  useEffect(() => {
    if (refSearch.current) {
      refSearch.current.focus();
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, [setQuery]);

  const { recentSearchItems, addRecentSearch } = useRecentSearch();

  return (
    <div className="pt-5">
      <SearchInput
        result={result}
        query={query}
        show={show}
        setQuery={setQuery}
        className="px-5 mb-6 d-lg-none"
      />
      <Tab.Container defaultActiveKey="all">
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
            <AllResultsTabContent
              result={result}
              clearSearch={clearSearch}
              recentSearchItems={recentSearchItems}
              addRecentSearch={addRecentSearch}
              favPages={favPages}
              addCurrentPageFavorite={addCurrentPageFavorite}
              isCurrentPageFavorite={isCurrentPageFavorite}
              isFavorite={isFavorite}
              addFavoritePage={addFavoritePage}
              removeFavorite={removeFavorite}
              close={close}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="organizations">
            <OrganizationsTabContent
              result={result}
              clearSearch={clearSearch}
              addRecentSearch={addRecentSearch}
              isFavorite={isFavorite}
              addFavoritePage={addFavoritePage}
              removeFavorite={removeFavorite}
              close={close}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="projects">
            <ProjectsTabContent
              result={result}
              clearSearch={clearSearch}
              addRecentSearch={addRecentSearch}
              isFavorite={isFavorite}
              addFavoritePage={addFavoritePage}
              removeFavorite={removeFavorite}
              close={close}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="resources">
            <ResourcesTabContent
              result={result}
              clearSearch={clearSearch}
              addRecentSearch={addRecentSearch}
              isFavorite={isFavorite}
              addFavoritePage={addFavoritePage}
              removeFavorite={removeFavorite}
              close={close}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};
