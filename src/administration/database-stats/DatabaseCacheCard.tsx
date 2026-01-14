import { FC } from 'react';
import { Col, ProgressBar, Row, Table } from 'react-bootstrap';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { translate } from '@waldur/i18n';

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
      className="mb-6"
    >
      <Row>
        <Col lg={6}>
          <h6 className="text-uppercase text-muted mb-3">
            {translate('Hit ratios')}
          </h6>
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <span>{translate('Buffer cache')}</span>
              <span className="fw-semibold">
                {formatPercent(data.buffer_cache_hit_ratio)}
              </span>
            </div>
            <ProgressBar
              now={data.buffer_cache_hit_ratio ?? 0}
              variant={getProgressVariant(bufferHealth)}
              style={{ height: '8px' }}
            />
          </div>
          <div>
            <div className="d-flex justify-content-between mb-1">
              <span>{translate('Index cache')}</span>
              <span className="fw-semibold">
                {formatPercent(data.index_hit_ratio)}
              </span>
            </div>
            <ProgressBar
              now={data.index_hit_ratio ?? 0}
              variant={getProgressVariant(indexHealth)}
              style={{ height: '8px' }}
            />
          </div>
        </Col>
        <Col lg={6}>
          <h6 className="text-uppercase text-muted mb-3">
            {translate('Memory settings')}
          </h6>
          <Table size="sm" borderless className="mb-0">
            <tbody>
              <tr>
                <td className="text-muted">{translate('Shared buffers')}</td>
                <td className="fw-semibold text-end">
                  <code>{data.shared_buffers}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Effective cache size')}
                </td>
                <td className="fw-semibold text-end">
                  <code>{data.effective_cache_size}</code>
                </td>
              </tr>
            </tbody>
          </Table>
          <small className="text-muted mt-3 d-block">
            {translate('Values are in 8KB pages')}
          </small>
        </Col>
      </Row>
    </AccordionCard>
  );
};
