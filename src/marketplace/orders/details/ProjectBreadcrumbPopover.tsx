import { projectsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { BreadcrumbDropdown } from '@waldur/navigation/header/breadcrumb/BreadcrumbDropdown';
import { BreadcrumbSearchItem } from '@waldur/navigation/header/breadcrumb/BreadcrumbSearchItem';

export const ProjectBreadcrumbPopover = ({ order, close }) => (
  <BreadcrumbDropdown
    fetcher={projectsList}
    queryKey="projectsList"
    queryField="query"
    params={{
      customer: [order.customer_uuid],
      field: ['name', 'uuid', 'image', 'created'],
      o: ['name'],
    }}
    RowComponent={({ row }) => (
      <BreadcrumbSearchItem
        to="project.dashboard"
        params={{ uuid: row.uuid }}
        image={row.image}
        title={row.name}
        subtitle={formatDateTime(row.created)}
        isCurrent={row.uuid === order.project_uuid}
      />
    )}
    placeholder={translate('Type to search projects...')}
    emptyMessage={translate('There are no projects.')}
    close={close}
  />
);
