import { CaretDown } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { Breadcrumb, OverlayTrigger, Popover } from 'react-bootstrap';

import { fixURL } from '@waldur/core/api';
import { BreadcrumbDropdown } from '@waldur/core/BreadcrumbDropdown';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { SearchItem } from '@waldur/navigation/header/search/SearchItem';

const ResourceRow = ({ row }) => (
  <SearchItem
    to="marketplace-resource-details"
    params={{
      resource_uuid: row.uuid,
    }}
    image={row.offering_thumbnail}
    title={row.name}
    subtitle={formatDateTime(row.created)}
  />
);

const ResourceBreadcrumbPopover = ({ resource }) => (
  <BreadcrumbDropdown
    api={fixURL('/marketplace-resources/')}
    queryField="query"
    params={{
      state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
      project_uuid: resource.project_uuid,
      category_uuid: resource.category_uuid,
      field: ['name', 'uuid', 'offering_thumbnail', 'state', 'created'],
    }}
    RowComponent={ResourceRow}
    placeholder={translate('Type in name of resource') + '...'}
    emptyMessage={translate('There are no resources.')}
  />
);

export const ResourcePopoverToggle = ({ resource }) => {
  const [show, setShow] = useState(false);
  const handleClickOutside = useCallback(
    (e) => {
      const popup = document.getElementById('ResourceBreadcrumbPopover');
      if (!popup) {
        return;
      }
      if (!popup.contains(e.target)) {
        setShow(false);
      }
    },
    [setShow],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-end"
      show={show}
      overlay={
        <Popover id="ResourceBreadcrumbPopover">
          {show && <ResourceBreadcrumbPopover resource={resource} />}
        </Popover>
      }
      rootClose={true}
    >
      <Breadcrumb.Item active onClick={() => setShow((v) => !v)}>
        {resource.name} <CaretDown size={18} className="svg-icon" />
      </Breadcrumb.Item>
    </OverlayTrigger>
  );
};
