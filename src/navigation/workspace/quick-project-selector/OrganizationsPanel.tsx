import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo, useCallback, FunctionComponent } from 'react';
import { Col, ListGroupItem, Stack } from 'react-bootstrap';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getProviderItems } from '@waldur/navigation/navitems';

import { getCustomersPage } from '../api';
import { ServiceProviderIcon } from '../ServiceProviderIcon';
import { VirtualPaginatedList } from '../VirtualPaginatedList';

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
  onSelect;
}> = ({ data, index, style, selected, onSelect }) => {
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
      onClick={onSelect}
      onMouseEnter={onSelect}
      style={style}
      className="cursor-pointer"
    >
      <Stack direction="horizontal" gap={4}>
        <ImagePlaceholder
          width="36px"
          height="36px"
          backgroundColor="#e2e2e2"
        />
        <span className="title lh-1">{truncate(item.name)}</span>
        <ServiceProviderIcon organization={item} className="ms-auto" />
      </Stack>
    </ListGroupItem>
  );
};

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;

export const OrganizationsPanel: FunctionComponent<{
  selectedOrganization;
  selectOrganization;
  filter;
}> = ({ selectedOrganization, selectOrganization, filter }) => {
  const { state } = useCurrentStateAndParams();
  const isServiceProvider = useMemo(
    () =>
      getProviderItems()
        .map((item) => item.to)
        .includes(state.name),
    [state.name],
  );
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
        <span className="fw-bold fs-7 text-decoration-underline text-muted">
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
              selected={selectedOrganization?.uuid === item.uuid}
              onSelect={() => selectOrganization(item)}
            />
          );
        }}
      </VirtualPaginatedList>
    </Col>
  );
};
