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
  const callback = (e) => {
    openDialog(FilterByOrgAndProjectDialog, {
      size: 'sm',
      initialValues: values,
    });
    e.stopPropagation();
  };
  return (
    <Tooltip label={translate('Filter resources')}>
      {/* A plain <span>, not <button>: this renders inside
          SidebarMenuAccordion's `badge` slot, which sits inside the
          accordion header's own real <button> (Collapsible.Trigger). A
          nested <button> there would be invalid HTML, silently reparented
          by the browser's parser. `stopPropagation` (already needed
          regardless, so this button's own click doesn't also toggle the
          accordion) plus explicit role/tabIndex/onKeyDown restore the same
          keyboard reachability a native <button> gave for free. */}
      <span
        role="button"
        tabIndex={0}
        className="relative flex size-6 shrink-0 items-center justify-center rounded text-[var(--nav-item-icon)] hover:bg-[var(--nav-item-hover-bg)]"
        onClick={callback}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback(e);
          }
        }}
        aria-label={translate('Filter resources')}
      >
        <FunnelSimpleIcon size={18} weight="bold" />
        {(values?.organization || values?.project) && (
          <HeaderButtonBullet
            size={9}
            blink={false}
            variant="primary"
            className="me-n2 mt-2 border border-2"
          />
        )}
      </span>
    </Tooltip>
  );
};
