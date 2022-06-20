import classNames from 'classnames';
import { useState, useCallback, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { getCustomersPage } from './api';
import { OrganizationListItem } from './OrganizationListItem';
import { SearchBox } from './SearchBox';
import { VirtualPaginatedList } from './VirtualPaginatedList';
import './OrganizationsSelector.scss';

const EmptyOrganizationListPlaceholder: FunctionComponent = () => (
  <span className="ellipsis">
    {translate('There are no organizations matching filter.')}
  </span>
);

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;

export const OrganizationsSelector: FunctionComponent<{
  selectedOrganization: Customer;
  selectOrganization;
}> = ({ selectedOrganization, selectOrganization }) => {
  const user = useSelector(getUser);
  const [filter, setFilter] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const getPage = useCallback(
    (page) => getCustomersPage(filter, page, VIRTUALIZED_SELECTOR_PAGE_SIZE),
    [filter],
  );

  const selectItem = useCallback(
    (item) => {
      selectOrganization(item);
      setShowOptions(false);
    },
    [selectOrganization],
  );

  return (
    <div
      className={classNames('organization-selector', { active: showOptions })}
    >
      <div className="d-grid gap-2">
        <button
          className="toggle btn btn-light btn-lg"
          onClick={() => setShowOptions(!showOptions)}
        >
          {selectedOrganization?.name ? (
            <span className="organization-selected">
              <ImagePlaceholder
                width="32px"
                height="32px"
                backgroundColor="#e2e2e2"
              />
              <span className="mx-4">{selectedOrganization.name}</span>
              <i
                className="fa fa-times"
                onClick={() => selectOrganization(undefined)}
              />
            </span>
          ) : (
            translate('Select an organization...')
          )}
          <span className="icon">
            <i
              className={classNames(
                'fa',
                showOptions ? 'fa-angle-up' : 'fa-angle-down',
              )}
            />
          </span>
        </button>
      </div>
      <div
        className={classNames('organization-select-options', 'bg-body', {
          active: showOptions,
        })}
      >
        <div className="p-4">
          <SearchBox
            groupId="organization-search-box"
            value={filter}
            onChange={setFilter}
            placeholder={translate('Search for organization...')}
          />
        </div>
        <VirtualPaginatedList
          height={300}
          itemSize={50}
          getPage={getPage}
          key={filter}
          elementsPerPage={VIRTUALIZED_SELECTOR_PAGE_SIZE}
          noResultsRenderer={EmptyOrganizationListPlaceholder}
        >
          {(listItemProps) => {
            const item = listItemProps.data[listItemProps.index];
            return (
              <OrganizationListItem
                {...listItemProps}
                selected={selectedOrganization?.uuid === item.uuid}
                onSelect={() => selectItem(item)}
                user={user}
              />
            );
          }}
        </VirtualPaginatedList>
      </div>
    </div>
  );
};
