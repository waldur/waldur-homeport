import { XIcon } from '@phosphor-icons/react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { CompactActionButton } from '@/table/CompactActionButton';
import { RemoveFilterBadgeButton } from '@/table/TableFilterItem';

import { getMarketplaceFilters } from './store/selectors';

export const PageBarFilters = () => {
  const filters = useSelector(getMarketplaceFilters);

  const { clearAllFilters, removeFilter } =
    useOrganizationAndProjectAutocompletesForResources();

  if (!filters?.length) return null;

  return (
    <div className="container-fluid bg-body">
      <div className="d-flex overflow-auto py-2">
        <div className="d-flex align-items-center gap-4 text-nowrap w-100">
          <span className="fw-bold">{translate('Filtered by')}:</span>
          {filters.map((item) => (
            <Stack
              key={item.name}
              direction="horizontal"
              gap={2}
              className="fw-bold"
            >
              {item.label}
              <Badge
                variant="default"
                rightIcon={
                  <RemoveFilterBadgeButton
                    onClick={() => removeFilter(item.name)}
                  />
                }
                pill
                outline
              >
                {item.getValueLabel
                  ? item.getValueLabel(item.value)
                  : typeof item.value === 'string'
                    ? item.value
                    : 'N/A'}
              </Badge>
            </Stack>
          ))}
          <CompactActionButton
            variant="text-secondary"
            className="btn-no-focus"
            action={clearAllFilters}
            iconNode={<XIcon weight="bold" />}
            title={translate('Clear filters')}
          />
        </div>
      </div>
    </div>
  );
};
