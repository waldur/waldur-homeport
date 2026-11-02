import { FC } from 'react';

import { AccordionCard, PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import type { CachePerformance } from './api';
import { formatPercent, getCacheHealth } from './utils';

interface DatabaseCacheCardProps {
  data: CachePerformance;
}

export const DatabaseCacheCard: FC<DatabaseCacheCardProps> = ({ data }) => {
  const bufferHealth = getCacheHealth(data.buffer_cache_hit_ratio);
  const indexHealth = getCacheHealth(data.index_hit_ratio);

  return (
    <AccordionCard
      id="database-cache"
      title={translate('Cache performance')}
      subtitle={translate('Buffer cache hit ratio: {ratio}', {
        ratio: formatPercent(data.buffer_cache_hit_ratio),
      })}
      defaultOpen={bufferHealth !== 'success' || indexHealth !== 'success'}
      className="mb-5"
    >
      <PropertyList
        variant="compact"
        className="grid grid-cols-1 lg:grid-cols-2 gap-x-5"
      >
        <PropertyList.Section title={translate('Hit ratios')}>
          <PropertyItem
            label={translate('Buffer cache')}
            value={propVal.meter(data.buffer_cache_hit_ratio, {
              format: 'percent',
              variant: { warning: 99, danger: 95 },
              polarity: 'positive',
              display: 'inline',
              label: translate('Buffer cache'),
            })}
          />
          <PropertyItem
            label={translate('Index cache')}
            value={propVal.meter(data.index_hit_ratio, {
              format: 'percent',
              variant: { warning: 99, danger: 95 },
              polarity: 'positive',
              display: 'inline',
              label: translate('Index cache'),
            })}
          />
        </PropertyList.Section>
        <PropertyList.Section
          title={translate('Memory settings')}
          description={translate('Values are in 8KB pages')}
        >
          <PropertyItem
            label={translate('Shared buffers')}
            value={propVal.code(data.shared_buffers)}
          />
          <PropertyItem
            label={translate('Effective cache size')}
            value={propVal.code(data.effective_cache_size)}
          />
        </PropertyList.Section>
      </PropertyList>
    </AccordionCard>
  );
};
