import classNames from 'classnames';
import { useState, useCallback, FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Customer } from '@waldur/workspace/types';

import { getCustomersPage } from './api';
import { CreateOrganizationButton } from './CreateOrganizationButton';
import { OrganizationListItem } from './OrganizationListItem';
import { SearchBox } from './SearchBox';
import { VirtualPaginatedList } from './VirtualPaginatedList';
import './OrganizationsSelector.scss';

const OrganizationsHeader = ({ organizationsCount }) => (
  <h3 className="m-b-md">
    {translate('Organizations ({count})', {
      count: organizationsCount,
    })}
  </h3>
);

const EmptyOrganizationListPlaceholder: FunctionComponent = () => (
  <span className="ellipsis">
    {translate('There are no organizations matching filter.')}
  </span>
);

const VIRTUALIZED_SELECTOR_PAGE_SIZE = 20;

export const OrganizationsSelector: FunctionComponent<{
  selectedOrganization: Customer;
  selectOrganization;
  organizationsCount;
}> = ({ selectedOrganization, selectOrganization, organizationsCount }) => {
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
    <Row>
      <Col className="workspace-listing m-b-md" xs={12}>
        <div className={classNames('metro-select', { active: showOptions })}>
          <button
            className="toggle btn btn-lg btn-block"
            onClick={() => setShowOptions(!showOptions)}
          >
            {selectedOrganization?.name ? (
              <span className="organization-selected">
                <img src="https://via.placeholder.com/28/7D9B83/FFFFFF?text=+" />
                <span className="m-l-md m-r-md">
                  {selectedOrganization.name}
                </span>
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
          <div
            className={classNames('metro-select-options', {
              active: showOptions,
            })}
          >
            <div className="p-sm">
              <CreateOrganizationButton />
              <OrganizationsHeader organizationsCount={organizationsCount} />
              <SearchBox
                groupId="organization-search-box"
                value={filter}
                onChange={setFilter}
                placeholder={translate('Filter organizations')}
              />
            </div>
            <VirtualPaginatedList
              height={300}
              itemSize={40}
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
                  />
                );
              }}
            </VirtualPaginatedList>
          </div>
        </div>
      </Col>
    </Row>
  );
};
