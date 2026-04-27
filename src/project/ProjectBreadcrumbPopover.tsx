import { projectsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BreadcrumbDropdown } from '@/navigation/header/breadcrumb/BreadcrumbDropdown';
import { BreadcrumbSearchItem } from '@/navigation/header/breadcrumb/BreadcrumbSearchItem';

export const ProjectBreadcrumbPopover = ({ project, close }) => (
  <BreadcrumbDropdown
    fetcher={projectsList}
    queryKey="projects"
    queryField="query"
    params={{
      customer: project.customer_uuid,
      field: ['name', 'uuid', 'image', 'customer_name'],
    }}
    RowComponent={({ row }) => (
      <BreadcrumbSearchItem
        to="project.dashboard"
        params={{ uuid: row.uuid }}
        title={row.name}
        subtitle={row.customer_name}
        image={row.image}
        isCurrent={row.uuid === project.uuid}
      />
    )}
    placeholder={translate('Type in name of project...')}
    emptyMessage={translate('There are no projects.')}
    close={close}
  />
);
