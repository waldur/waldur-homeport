import { FC } from 'react';
import { Col, Row, Table } from 'react-bootstrap';

import { AccordionCard, Progress } from 'waldur-ui';

import { translate } from '@/i18n';

import type { CachePerformance } from './api';
import { formatPercent, getCacheHealth } from './utils';

interface DatabaseCacheCardProps {
  data: CachePerformance;
}

export const DatabaseCacheCard: FC<DatabaseCacheCardProps> = ({ data }) => {
  const bufferHealth = getCacheHealth(data.buffer_cache_hit_ratio);
  const indexHealth = getCacheHealth(data.index_hit_ratio);

  const getProgressVariant = (health: string) => {
    if (health === 'danger') return 'danger';
    if (health === 'warning') return 'warning';
    return 'success';
  };

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
      <Row>
        <Col lg={6}>
          <h6 className="text-uppercase text-quaternary mb-2.5">
            {translate('Hit ratios')}
          </h6>
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span>{translate('Buffer cache')}</span>
              <span>{formatPercent(data.buffer_cache_hit_ratio)}</span>
            </div>
            <Progress
              value={data.buffer_cache_hit_ratio ?? 0}
              variant={getProgressVariant(bufferHealth)}
              label={translate('Buffer cache')}
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>{translate('Index cache')}</span>
              <span>{formatPercent(data.index_hit_ratio)}</span>
            </div>
            <Progress
              value={data.index_hit_ratio ?? 0}
              variant={getProgressVariant(indexHealth)}
              label={translate('Index cache')}
            />
          </div>
        </Col>
        <Col lg={6}>
          <h6 className="text-uppercase text-quaternary mb-2.5">
            {translate('Memory settings')}
          </h6>
          <Table size="sm" borderless className="mb-0">
            <tbody>
              <tr>
                <td className="text-quaternary">
                  {translate('Shared buffers')}
                </td>
                <td className="text-end">
                  <code>{data.shared_buffers}</code>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Effective cache size')}
                </td>
                <td className="text-end">
                  <code>{data.effective_cache_size}</code>
                </td>
              </tr>
            </tbody>
          </Table>
          <small className="text-quaternary mt-2.5 block">
            {translate('Values are in 8KB pages')}
          </small>
        </Col>
      </Row>
    </AccordionCard>
  );
};
