import { useCallback, FunctionComponent } from 'react';
import { Col, ListGroupItem, Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { getCustomersPage } from '../api';
import { CallManagerIcon } from '../CallManagerIcon';
import { highlightMatch } from '../highlightMatch';
import { ServiceProviderIcon } from '../ServiceProviderIcon';
import { VirtualPaginatedList } from '../VirtualPaginatedList';

import { ItemIcon } from './ItemIcon';

const EmptyOrganizationListPlaceholder: FunctionComponent = () => (
  <p className="text-center ellipsis my-10 mx-4">
    {translate('There are no organizations.')}
  </p>
);

export const OrganizationListItem: FunctionComponent<{
  data;
  index;
  style;
  active;
  selected;
  onClick;
  onMouseEnter;
  filter;
  loading;
}> = ({
  data,
  index,
  style,
  active,
  selected,
  onClick,
  onMouseEnter,
  filter,
  loading,
}) => {
  const customer = useSelector(getCustomer);
  const item = data[index];
  const orgCompactName = item.abbreviation ? item.abbreviation : item.name;
  if (item.isFetching) {
    return (
      <ListGroupItem className="text-center" style={style}>
        {translate('fetching')}
      </ListGroupItem>
    );
  }

  if (item.isFailed) {
    return (
      <ListGroupItem className="text-center" style={style}>
        {translate('failed')}
      </ListGroupItem>
    );
  }

  return (
    <ListGroupItem
      active={active}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={style}
      className={'cursor-pointer' + (selected ? ' selected' : '')}
      title={item.abbreviation ? item.name : null}
    >
      <Stack direction="horizontal">
        <Stack direction="horizontal" gap={4} className="item-content">
          <ItemIcon item={item} />
          <div className="overflow-hidden">
            <p
              className={
                'title ellipsis mb-0' + (selected ? ' fw-boldest' : '')
              }
            >
              {filter ? highlightMatch(orgCompactName, filter) : orgCompactName}{' '}
              {selected && (
                <span className="fw-normal">
                  ({translate('Current organization')})
                </span>
              )}
            </p>
            <div className="item-info">
              {item.projects_count ? (
                customer?.uuid !== item.uuid && filter !== '' ? (
                  <small>
                    {item.projects_count}{' '}
                    {item.projects_count > 1
                      ? translate('Projects')
                      : translate('Project')}
                    {', '}
                    {translate('shown')} {item.projects.length}
                  </small>
                ) : customer?.uuid === item.uuid ? (
                  <small>
                    {item.projects_count}{' '}
                    {item.projects_count > 1
                      ? translate('Projects')
                      : translate('Project')}
                  </small>
                ) : filter === '' ? (
                  <small>
                    {item.projects_count}{' '}
                    {item.projects_count > 1
                      ? translate('Projects')
                      : translate('Project')}
                  </small>
                ) : null
              ) : (
                <i>{translate('No project')}</i>
              )}
            </div>
            <div className="item-link">
              <Link state="organization.dashboard" params={{ uuid: item.uuid }}>
                {translate('Go to organization dashboard')}
              </Link>
            </div>
          </div>
          <div className="ms-auto">{loading && <LoadingSpinnerIcon />}</div>
        </Stack>
        {item?.is_service_provider && (
          <div className="actions ms-auto">
            <Link
              className="action-item"
              state="marketplace-provider-dashboard"
              params={{ uuid: item.uuid }}
              onClick={(e) => {
                e.stopPropagation();
                MenuComponent.hideDropdowns(undefined);
              }}
            >
              <ServiceProviderIcon organization={item} />
            </Link>
          </div>
        )}
        {item?.is_call_managing_organization &&
          isFeatureVisible(
            'marketplace.show_call_management_functionality',
          ) && (
            <div className="actions ms-auto">
              <Link
                className="action-item"
                state="organization.call-management"
                params={{ uuid: item.uuid }}
                onClick={(e) => {
                  e.stopPropagation();
                  MenuComponent.hideDropdowns(undefined);
                }}
              >
                <CallManagerIcon organization={item} />
              </Link>
            </div>
          )}
      </Stack>
    </ListGroupItem>
  );
};

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;

export const OrganizationsPanel: FunctionComponent<{
  /** The customer we hovered - means we want to see the projects of this customer */
  active: Customer;
  /** The current selected customer */
  selected: Customer;
  loadingUuid: string;
  filter;
  isServiceProvider: boolean;
  showAllProjects: boolean;
  onClick(customer: Customer): void;
  onMouseEnter(customer: Customer): void;
}> = ({
  active,
  selected,
  loadingUuid,
  filter,
  isServiceProvider,
  showAllProjects,
  onClick,
  onMouseEnter,
}) => {
  const calculateInitialPageSize = () => {
    const screenHeight = window.innerHeight;
    return screenHeight * 0.85;
  };

  const getPage = useCallback(
    (page) =>
      getCustomersPage(
        filter,
        page,
        VIRTUALIZED_SELECTOR_PAGE_SIZE,
        isServiceProvider,
        showAllProjects,
      ),
    [filter, isServiceProvider, showAllProjects],
  );

  return (
    <Col className="organization-listing" xs={5}>
      <VirtualPaginatedList
        height={calculateInitialPageSize()}
        itemSize={55}
        getPage={getPage}
        key={`${filter}-${isServiceProvider}-${showAllProjects}`}
        elementsPerPage={VIRTUALIZED_SELECTOR_PAGE_SIZE}
        noResultsRenderer={EmptyOrganizationListPlaceholder}
      >
        {(listItemProps) => {
          const item = listItemProps.data[listItemProps.index];
          return (
            <OrganizationListItem
              {...listItemProps}
              active={active?.uuid === item.uuid}
              selected={selected?.uuid === item.uuid}
              onClick={() => onClick(item)}
              onMouseEnter={() => onMouseEnter(item)}
              filter={filter}
              loading={loadingUuid === item.uuid}
            />
          );
        }}
      </VirtualPaginatedList>
    </Col>
  );
};
