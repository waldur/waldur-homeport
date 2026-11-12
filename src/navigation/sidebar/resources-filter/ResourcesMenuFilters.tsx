import { XIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { SidebarMenuSeparator, Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';
import { ALL_RESOURCES_TABLE_ID } from '@/marketplace/resources/list/constants';
import { selectFiltersStorage } from '@/table/selectors';

import { useOrganizationAndProjectAutocompletesForResources } from './utils';

export const ResourcesMenuFilters = () => {
  const filters = useSelector((state: any) =>
    selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID),
  );

  const filterItem = useMemo(() => {
    if (!filters) return null;
    const project = filters.find((item) => item.name === 'project');
    if (!project) {
      return filters.find((item) => item.name === 'organization');
    }
    return project;
  }, [filters]);

  const { removeFilter } = useOrganizationAndProjectAutocompletesForResources();

  return (
    <>
      <li>
        {filterItem ? (
          <Tooltip label={filterItem.value?.name}>
            <div
              className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 min-h-10"
              data-testid="sidebar-resources-filter-item"
            >
              <span
                // text-sm font-medium text-[var(--nav-item-icon)]: measured
                // live on rest-test.nodeconductor.com — the "Organization"
                // label is 14px/500 (same size/weight as a full-strength
                // nav item, e.g. "Add resource"), just in the muted
                // gray-500 tone that --nav-item-icon resolves to for the
                // light sidebar style, not the smaller --nav-section-label
                // (gray-400) caption tone.
                className="text-sm font-medium text-[var(--nav-item-icon)]"
                data-testid="sidebar-resources-filter-label"
              >
                {filterItem.label}
              </span>
              <span
                // rounded-lg (8px) + text-sm: a
                // rounded rect chip at ~14px text — this is the
                // value itself (the org/project name), so it stays at full
                // text-sm/--nav-item-text strength regardless of the
                // smaller, muted caption label beside it.
                // gap-[4px] + pr-[9px]: reserves 4px
                // between the text and the icon, and 9px
                // between the icon and the badge's own right edge.
                className="flex max-w-[60%] items-center gap-[4px] truncate rounded-lg bg-[var(--nav-item-active-bg)] py-[3px] pr-[9px] pl-[11px] text-sm text-[var(--nav-item-text)]"
              >
                <span className="truncate">
                  {filterItem.value?.abbreviation || filterItem.value?.name}
                </span>
                {/* A plain button adapts to the sidebar's theme tokens. */}
                <button
                  type="button"
                  onClick={() => removeFilter(filterItem.name)}
                  aria-label={translate('Remove filter')}
                  // size-[12px], not size-3: this app's 13px root
                  // font-size shrinks rem-based utilities — size-3 (0.75rem)
                  // would render as 9.75px instead of the 12px needed.
                  className="flex size-[12px] shrink-0 items-center justify-center text-[var(--nav-item-icon)] hover:text-[var(--nav-item-text)]"
                >
                  <XIcon weight="bold" size={12} />
                </button>
              </span>
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center justify-center px-2.5 py-1.5 min-h-10 text-center text-sm font-semibold text-[var(--nav-item-text)]">
            {translate('Resources in all visible projects')}
          </div>
        )}
      </li>
      <SidebarMenuSeparator />
    </>
  );
};
