import { XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Badge, BaseButton, useBreakpointUp } from 'waldur-ui';

import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { LayoutSlot } from '@/navigation/slots';
import { RemoveFilterBadgeButton } from '@/table/TableFilterItem';
import { useUser } from '@/workspace/hooks';

import { MarketplaceLandingFilter } from '../MarketplaceLandingFilter';

import { getMarketplaceFilters } from './store/selectors';

const getFilterValueLabel = (item) =>
  item.getValueLabel
    ? item.getValueLabel(item.value)
    : typeof item.value === 'string'
      ? item.value
      : 'N/A';

/**
 * The marketplace's filter bar under the page tabs: the filters in force,
 * one chip each, and, with `withPicker`, the organization & project picker
 * ahead of them (signed-in users only). It scrolls sideways instead of
 * squeezing the tabs.
 */
const PageBarFilters = ({ withPicker = false }: { withPicker?: boolean }) => {
  const filters = useSelector(getMarketplaceFilters);

  const { clearAllFilters, removeFilter } =
    useOrganizationAndProjectAutocompletesForResources();

  return (
    <div
      className={classNames(
        PAGE_CONTAINER_CLASSNAME,
        'flex items-center bg-primary',
      )}
    >
      <div className="flex w-full items-center gap-3 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {withPicker && <MarketplaceLandingFilter size="sm" />}
        {filters?.length > 0 && (
          <>
            <span className="font-medium">{translate('Filtered by')}:</span>
            {filters.map((item) => (
              <Stack
                key={item.name}
                direction="horizontal"
                className="gap-1.5 font-medium"
              >
                {item.label}
                <Badge
                  variant="neutral"
                  rightIcon={
                    <RemoveFilterBadgeButton
                      onClick={() => removeFilter(item.name)}
                    />
                  }
                  shape="pill"
                  tone="outline"
                >
                  {getFilterValueLabel(item)}
                </Badge>
              </Stack>
            ))}
            <BaseButton
              variant="text-secondary"
              className="btn-no-focus"
              onClick={clearAllFilters}
              iconNode={<XIcon weight="bold" />}
              label={translate('Clear filters')}
              size="sm"
            />
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Puts the marketplace's scope filter on a page. From lg the organization &
 * project picker sits at the end of the tab row, at the tabs' size, and the
 * filters in force get the bar under the tabs; below lg the picker moves
 * into that bar too (the tab row is the tabs' alone), so a signed-in user
 * always has the bar.
 */
export const MarketplaceScopeBar = () => {
  const signedIn = Boolean(useUser());
  const hasFilters = useSelector(getMarketplaceFilters).length > 0;
  const desktop = useBreakpointUp('lg');
  return (
    <>
      {signedIn && desktop && (
        <LayoutSlot name="actions">
          <MarketplaceLandingFilter align="end" size="md" />
        </LayoutSlot>
      )}
      {desktop
        ? hasFilters && (
            <LayoutSlot name="filters">
              <PageBarFilters />
            </LayoutSlot>
          )
        : (signedIn || hasFilters) && (
            <LayoutSlot name="filters">
              <PageBarFilters withPicker />
            </LayoutSlot>
          )}
    </>
  );
};
