import { FC } from 'react';
import { Table } from 'react-bootstrap';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

import type { LockStats } from './api';
import { getLocksHealth } from './utils';

interface DatabaseLocksCardProps {
  data: LockStats;
}

export const DatabaseLocksCard: FC<DatabaseLocksCardProps> = ({ data }) => {
  const health = getLocksHealth(data.waiting_locks);
  const hasExclusiveLocks = data.access_exclusive_locks > 0;

  return (
    <AccordionCard
      id="database-locks"
      title={translate('Locks')}
      subtitle={translate('{total} locks held, {waiting} waiting', {
        total: data.total_locks,
        waiting: data.waiting_locks,
      })}
      defaultOpen={health !== 'success' || hasExclusiveLocks}
      className="mb-6"
    >
      <Table
        size="sm"
        borderless
        className="mb-0"
        style={{ maxWidth: '400px' }}
      >
        <tbody>
          <tr>
            <td className="text-muted">{translate('Total locks')}</td>
            <td className="fw-semibold text-end">
              {data.total_locks.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="text-muted">{translate('Waiting locks')}</td>
            <td className="text-end">
              {data.waiting_locks > 0 ? (
                <Badge
                  variant={health === 'danger' ? 'danger' : 'warning'}
                  pill
                  outline
                >
                  {data.waiting_locks}
                </Badge>
              ) : (
                <span className="fw-semibold text-success">0</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="text-muted">
              {translate('Access exclusive locks')}
            </td>
            <td className="text-end">
              {data.access_exclusive_locks > 0 ? (
                <Badge variant="warning" pill outline>
                  {data.access_exclusive_locks}
                </Badge>
              ) : (
                <span className="fw-semibold">0</span>
              )}
            </td>
          </tr>
        </tbody>
      </Table>
      {hasExclusiveLocks && (
        <small className="text-warning mt-3 d-block">
          {translate(
            'Access exclusive locks block all other access. This may indicate DDL operations or maintenance in progress.',
          )}
        </small>
      )}
    </AccordionCard>
  );
};
