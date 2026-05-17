import { LockIcon, PlusIcon, XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { groupBy, isEmpty } from 'lodash-es';
import { Fragment, useCallback } from 'react';
import { Col, Nav, Row, Tab } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { formatPhoneNumber } from '@/core/utils';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

import { useFavoritePages } from '../favorite-pages/FavoritePageService';

import { NoResult } from './NoResult';
import { RecentSearchItem } from './RecentSearchItem';
import { useRecentSearch } from './RecentSearchService';
import { SearchInput } from './SearchInput';
import { SearchItem } from './SearchItem';
import { SearchResult, UsersSearchResult } from './useSearch';

interface SearchPopoverProps {
  result: SearchResult;
  usersResult: UsersSearchResult;
  query: string;
  show: boolean;
  setQuery;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isStaffOrSupportUser: boolean;
  close(): void;
}

interface TabContentProps
  extends
    Partial<ReturnType<typeof useFavoritePages>>,
    Partial<ReturnType<typeof useRecentSearch>> {
  result: SearchResult;
  clearSearch(): void;
  close(): void;
}

const SectionTitle = ({ title, className = '' }) => (
  <h6 className={classNames('text-gray-700 fw-bold mb-3 mx-5', className)}>
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
  clearRecentSearches,
  close,
}: TabContentProps) => {
  return (
    <Row className="mx-0">
      <Col md={12} lg={6} className="py-5 px-0">
        {Boolean(recentSearchItems?.length) && (
          <div className="mb-3">
            <div className="d-flex align-items-center justify-content-between mx-5 mb-3">
              <h6 className="text-gray-700 fw-bold mb-0">
                {translate('Recent')}
              </h6>
              <CompactActionButton
                variant="text-secondary"
                className="btn-no-focus"
                action={clearRecentSearches}
                iconNode={<XIcon weight="bold" />}
                title={translate('Clear')}
              />
            </div>
            {recentSearchItems.map((item) => (
              <RecentSearchItem key={item.id} item={item} />
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
            <SubmitButton
              submitting={false}
              type="button"
              variant="text-primary"
              className="btn-sm ms-5"
              onClick={addCurrentPageFavorite}
              label={translate('Add current page')}
              iconNode={<PlusIcon weight="bold" />}
              iconOnLeft
            />
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
                    subtitle={item.abbreviation}
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
                    params={{
                      uuid: item.uuid,
                      customer_uuid: item.customer_uuid, // only for the resources filter
                      customer_name: item.customer_name, // only for the resources filter
                    }}
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
                        project_uuid: resource.project_uuid, // only for the resources filter
                        project_name: resource.project_name, // only for the resources filter
                        customer_uuid: resource.customer_uuid, // only for the resources filter
                        customer_name: resource.customer_name, // only for the resources filter
                      }}
                      image={resource.offering_thumbnail}
                      title={resource.name}
                      subtitle={`${resource.customer_name} / ${resource.project_name} / ${resource.category_title}`}
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
          isVisible={!result.data?.resultsCount && result.status !== 'pending'}
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
              subtitle={item.abbreviation}
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
          isEmpty(result.data?.customers) && result.status !== 'pending'
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
              params={{
                uuid: item.uuid,
                customer_uuid: item.customer_uuid, // only for the resources filter
                customer_name: item.customer_name, // only for the resources filter
              }}
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
          isEmpty(result.data?.projects) && result.status !== 'pending'
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
    ? groupBy(result.data.resources, (item) => item.category_title)
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
                    project_uuid: resource.project_uuid, // only for the resources filter
                    project_name: resource.project_name, // only for the resources filter
                    customer_uuid: resource.customer_uuid, // only for the resources filter
                    customer_name: resource.customer_name, // only for the resources filter
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
        isVisible={isEmpty(resourceGroups) && result.status !== 'pending'}
        callback={clearSearch}
      />
    </>
  );
};

const formatUserSubtitle = (user) => {
  const parts: string[] = [];

  // Status first
  parts.push(
    user.is_active ? `✓ ${translate('Active')}` : `✗ ${translate('Inactive')}`,
  );

  if (user.email) parts.push(user.email);
  const formattedPhone = formatPhoneNumber(user.phone_number);
  if (formattedPhone) parts.push(formattedPhone);
  if (user.organization) parts.push(user.organization);

  const orgRoles = user.permissions?.filter((p) => p.scope_type === 'customer');
  const projectRoles = user.permissions?.filter(
    (p) => p.scope_type === 'project',
  );

  if (orgRoles?.length > 0) {
    parts.push(
      translate('{count} org role(s)', { count: orgRoles.length.toString() }),
    );
  }
  if (projectRoles?.length > 0) {
    parts.push(
      translate('{count} project role(s)', {
        count: projectRoles.length.toString(),
      }),
    );
  }

  return parts.join(' • ');
};

const UsersTabContent = ({
  usersResult,
  clearSearch,
  addRecentSearch,
  isFavorite,
  addFavoritePage,
  removeFavorite,
  close,
}: {
  usersResult: UsersSearchResult;
  clearSearch(): void;
  addRecentSearch(item, type): void;
  isFavorite: TabContentProps['isFavorite'];
  addFavoritePage: TabContentProps['addFavoritePage'];
  removeFavorite: TabContentProps['removeFavorite'];
  close(): void;
}) => {
  return (
    <>
      {usersResult?.data?.usersCount ? (
        <div className="py-5">
          {usersResult.data.users.map((user) => (
            <SearchItem
              key={user.uuid}
              to="support-user-manage"
              params={{ user_uuid: user.uuid }}
              title={user.full_name || user.email}
              subtitle={formatUserSubtitle(user)}
              isFavorite={isFavorite}
              addFavoritePage={addFavoritePage}
              removeFavorite={removeFavorite}
              onClick={(item) => {
                addRecentSearch(item, 'user');
                close();
              }}
            />
          ))}
        </div>
      ) : null}
      <NoResult
        isVisible={
          !usersResult?.data?.usersCount && usersResult?.status !== 'pending'
        }
        callback={clearSearch}
      />
    </>
  );
};

export const SearchPopover = ({
  result,
  usersResult,
  query,
  show,
  setQuery,
  activeTab,
  setActiveTab,
  isStaffOrSupportUser,
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

  const clearSearch = useCallback(() => {
    setQuery('');
  }, [setQuery]);

  const { recentSearchItems, addRecentSearch, clearRecentSearches } =
    useRecentSearch();

  return (
    <div className="pt-5">
      <SearchInput
        result={result}
        query={query}
        show={show}
        setQuery={setQuery}
        className="px-5 mb-6"
        autoFocus
      />

      <Tab.Container
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
      >
        <div className="overflow-auto">
          <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
            <Nav.Item className="text-nowrap ms-5">
              <Nav.Link eventKey="all">
                {translate('All results')}
                {Boolean(result.data) && (
                  <Badge variant="default" pill outline className="ms-2">
                    {result.data.resultsCount}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="text-nowrap">
              <Nav.Link eventKey="organizations">
                {translate('Organizations')}
                {Boolean(result.data) && (
                  <Badge variant="default" pill outline className="ms-2">
                    {result.data.customersCount}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="text-nowrap">
              <Nav.Link eventKey="projects">
                {translate('Projects')}
                {Boolean(result.data) && (
                  <Badge variant="default" pill outline className="ms-2">
                    {result.data.projectsCount}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item
              className={
                isStaffOrSupportUser ? 'text-nowrap' : 'text-nowrap me-5'
              }
            >
              <Nav.Link eventKey="resources">
                {translate('Resources')}
                {Boolean(result.data) && (
                  <Badge variant="default" pill outline className="ms-2">
                    {result.data.resourcesCount}
                  </Badge>
                )}
              </Nav.Link>
            </Nav.Item>
            {isStaffOrSupportUser && (
              <Nav.Item className="text-nowrap me-5">
                <Nav.Link eventKey="users">
                  <LockIcon size={14} className="me-1" weight="bold" />
                  {translate('Users')}
                  {Boolean(usersResult?.data) && (
                    <Badge variant="default" pill outline className="ms-2">
                      {usersResult.data.usersCount}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </div>
        <Tab.Content className="overflow-auto min-h-200px">
          <Tab.Pane eventKey="all">
            <AllResultsTabContent
              result={result}
              clearSearch={clearSearch}
              recentSearchItems={recentSearchItems}
              addRecentSearch={addRecentSearch}
              clearRecentSearches={clearRecentSearches}
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
          {isStaffOrSupportUser && (
            <Tab.Pane eventKey="users">
              <UsersTabContent
                usersResult={usersResult}
                clearSearch={clearSearch}
                addRecentSearch={addRecentSearch}
                isFavorite={isFavorite}
                addFavoritePage={addFavoritePage}
                removeFavorite={removeFavorite}
                close={close}
              />
            </Tab.Pane>
          )}
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};
