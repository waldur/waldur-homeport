import { CaretDown } from '@phosphor-icons/react';
import { useOnStateChanged } from '@uirouter/react';
import { useCallback, useEffect, useState } from 'react';
import { Breadcrumb, OverlayTrigger, Popover } from 'react-bootstrap';

import { fixURL } from '@waldur/core/api';
import { BreadcrumbDropdown } from '@waldur/core/BreadcrumbDropdown';
import { translate } from '@waldur/i18n';
import { SearchItem } from '@waldur/navigation/header/search/SearchItem';

const ProjectListItem = ({ row }) => (
  <SearchItem
    key={row.uuid}
    to="project.dashboard"
    params={{ uuid: row.uuid }}
    title={row.name}
    subtitle={row.customer_name}
    image={row.image}
  />
);
export const ProjectPopoverToggle = ({ project }) => {
  const [show, setShow] = useState(false);
  const handleClickOutside = useCallback(
    (e) => {
      const popup = document.getElementById('ProjectBreadcrumbPopover');
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

  useOnStateChanged(() => {
    setShow(false);
  });

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-end"
      show={show}
      overlay={
        <Popover id="ProjectBreadcrumbPopover">
          {show && (
            <BreadcrumbDropdown
              api={fixURL('/projects/')}
              queryField="query"
              params={{
                customer: project.customer_uuid,
                field: ['name', 'uuid', 'image'],
              }}
              RowComponent={ProjectListItem}
              placeholder={translate('Type in name of project') + '...'}
              emptyMessage={translate('There are no projects.')}
            />
          )}
        </Popover>
      }
      rootClose={true}
    >
      <Breadcrumb.Item active onClick={() => setShow((v) => !v)}>
        {project.name} <CaretDown size={18} className="svg-icon" />
      </Breadcrumb.Item>
    </OverlayTrigger>
  );
};
