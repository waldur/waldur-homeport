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
              className="flex items-center justify-between gap-2 px-3 py-1.5 min-h-10"
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
                // rounded-lg (8px) + text-sm, not rounded-full + text-xs —
                // Metronic's real .badge-lg chip (measured live) is a
                // rounded rect, not a pill, at ~14px text — this is the
                // value itself (the org/project name), so it stays at full
                // text-sm/--nav-item-text strength regardless of the
                // smaller, muted caption label beside it.
                // gap-[4px] (not gap-1 — the app's legacy 13px root
                // font-size, see sidebarMenuButtonVariants' own comment,
                // shrinks gap-1's 0.25rem to 3.25px) + pr-[9px], not
                // gap-1.5/pr-[3px]: Metronic's real .badge-lg.has-right-icon
                // (measured live) reserves $badge-icon-space (4px) between
                // the text and the icon, and $badge-padding-x-lg - 2px
                // (9px) between the icon and the badge's own right edge —
                // this reproduces that exact spacing with a flex gap
                // instead of the original's absolutely-positioned
                // .right-icon.
                className="flex max-w-[60%] items-center gap-[4px] truncate rounded-lg bg-[var(--nav-item-active-bg)] py-[3px] pr-[9px] pl-[11px] text-sm text-[var(--nav-item-text)]"
              >
                <span className="truncate">
                  {filterItem.value?.abbreviation || filterItem.value?.name}
                </span>
                {/* Not the shared RemoveFilterBadgeButton: its own
                    text-gray-400/text-hover-gray-500 classes are Bootstrap
                    utilities marked !important in Metronic's (unlayered)
                    stylesheet, which no Tailwind utility class can ever
                    override — including with Tailwind's own `!` modifier,
                    since a layered !important always loses to an
                    unlayered one regardless of source order (confirmed
                    live: the override silently no-opped). That default
                    gray is fine for RemoveFilterBadgeButton's other,
                    still-Bootstrap callers (regular light-background table
                    filters), but doesn't adapt to the sidebar's own theme
                    tokens — measured live, it rendered as a near-invisible
                    mid-gray against a dark sidebar style's active-bg pill.
                    A plain button sidesteps the fight entirely. */}
                <button
                  type="button"
                  onClick={() => removeFilter(filterItem.name)}
                  aria-label={translate('Remove filter')}
                  // size-[12px], not size-3: this app's legacy 13px root
                  // font-size (see sidebarMenuButtonVariants' own comment)
                  // shrinks rem-based utilities — size-3 (0.75rem) would
                  // render as 9.75px instead of the 12px this reproduces
                  // (Metronic's real $badge-icon-size, measured live).
                  className="flex size-[12px] shrink-0 items-center justify-center text-[var(--nav-item-icon)] hover:text-[var(--nav-item-text)]"
                >
                  <XIcon weight="bold" size={12} />
                </button>
              </span>
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center justify-center px-3 py-1.5 min-h-10 text-center text-sm font-semibold text-[var(--nav-item-text)]">
            {translate('Resources in all visible projects')}
          </div>
        )}
      </li>
      <SidebarMenuSeparator />
    </>
  );
};
