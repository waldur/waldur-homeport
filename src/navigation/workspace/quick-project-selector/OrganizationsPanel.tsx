import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, FunctionComponent } from 'react';
import { Col, ListGroupItem, Stack } from 'react-bootstrap';

import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { isChildOf } from '@waldur/navigation/useTabs';
import { Customer } from '@waldur/workspace/types';

import { getCustomersPage } from '../api';
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
  selected;
  onClick;
  onMouseEnter;
  filter;
}> = ({ data, index, style, selected, onClick, onMouseEnter, filter }) => {
  const item = data[index];
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
      active={selected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={style}
      className="cursor-pointer"
    >
      <Stack direction="horizontal" gap={4}>
        <ItemIcon item={item} />
        <span className="title lh-1">
          {filter
            ? highlightMatch(truncate(item.name), filter)
            : truncate(item.name)}
        </span>
        <ServiceProviderIcon organization={item} className="ms-auto" />
      </Stack>
    </ListGroupItem>
  );
};

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;

export const OrganizationsPanel: FunctionComponent<{
  active;
  filter;
  onClick(customer: Customer): void;
  onMouseEnter;
}> = ({ active, filter, onClick, onMouseEnter }) => {
  const { state } = useCurrentStateAndParams();
  const isServiceProvider = isChildOf('marketplace-provider', state);
  const getPage = useCallback(
    (page) =>
      getCustomersPage(
        filter,
        page,
        VIRTUALIZED_SELECTOR_PAGE_SIZE,
        isServiceProvider,
      ),
    [filter, isServiceProvider],
  );

  return (
    <Col className="organization-listing" xs={5}>
      <div className="py-1 px-4 border-gray-300 border-bottom">
        <span className="fw-bold fs-7 text-muted">
          {translate('Organization')}
        </span>
      </div>
      <VirtualPaginatedList
        height={800}
        itemSize={50}
        getPage={getPage}
        key={`${filter}-${isServiceProvider}`}
        elementsPerPage={VIRTUALIZED_SELECTOR_PAGE_SIZE}
        noResultsRenderer={EmptyOrganizationListPlaceholder}
      >
        {(listItemProps) => {
          const item = listItemProps.data[listItemProps.index];
          return (
            <OrganizationListItem
              {...listItemProps}
              selected={active?.uuid === item.uuid}
              onClick={() => onClick(item)}
              onMouseEnter={() => onMouseEnter(item)}
              filter={filter}
            />
          );
        }}
      </VirtualPaginatedList>
    </Col>
  );
};
