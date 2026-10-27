import { FunnelSimpleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Tooltip } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ALL_RESOURCES_TABLE_ID } from '@/marketplace/resources/list/constants';
import { useModal } from '@/modal/actions';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';
import { selectFiltersStorage } from '@/table/selectors';

const FilterByOrgAndProjectDialog = lazyComponent(() =>
  import('./FilterByOrgAndProjectDialog').then((module) => ({
    default: module.FilterByOrgAndProjectDialog,
  })),
);

export const ResourcesMenuFilterButton = () => {
  const filters = useSelector((state: any) =>
    selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID),
  );
  const values = useMemo(() => {
    if (!filters) return null;
    const project = filters.find((item) => item.name === 'project');
    const organization = filters.find((item) => item.name === 'organization');
    return { project: project?.value, organization: organization?.value };
  }, [filters]);

  const { openDialog } = useModal();
  const callback = () => {
    openDialog(FilterByOrgAndProjectDialog, {
      size: 'sm',
      initialValues: values,
    });
  };
  return (
    <Tooltip label={translate('Filter resources')}>
      {/* A real button: it is rendered through SidebarMenuAccordion's
          `action` slot, beside the accordion trigger rather than inside it,
          so it no longer has to fake one with a span. */}
      <button
        type="button"
        className="relative flex size-6 shrink-0 items-center justify-center rounded text-[var(--nav-item-icon)] hover:bg-[var(--nav-item-hover-bg)]"
        onClick={callback}
        aria-label={translate('Filter resources')}
      >
        <FunnelSimpleIcon size={18} weight="bold" />
        {(values?.organization || values?.project) && (
          <HeaderButtonBullet
            size={9}
            blink={false}
            variant="primary"
            className="-me-1.5 mt-1.5 border border-2"
          />
        )}
      </button>
    </Tooltip>
  );
};
