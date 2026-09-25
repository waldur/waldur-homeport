import classNames from 'classnames';
import { ReactNode } from 'react';
import { Col, Row } from 'react-bootstrap';

import { StatsCard } from './StatsCard';

export const SummaryWidget = ({
  stats,
  className,
  spaceless,
}: {
  stats: Array<{ label: ReactNode; value: ReactNode; footer?: ReactNode }>;
  // Callers outside a padded container (e.g. a TableWithTabs pane) pass `mx-0`
  // to cancel the row's negative gutter margins, which would otherwise bleed
  // past the pane and get clipped by its overflow.
  className?: string;
  /**
   * Drops the default bottom margin, for when whatever follows brings its own
   * top spacing. It has to be a prop rather than an `mb-0` in `className`:
   * Bootstrap generates its spacing utilities with `!important`, so `mb-5`
   * cannot be overridden from outside.
   */
  spaceless?: boolean;
}) => {
  const colWidth =
    stats.length === 5
      ? null
      : Math.max(2, Math.floor(12 / Math.min(stats.length, 6)));

  return (
    <Row className={classNames('g-4', !spaceless && 'mb-5', className)}>
      {stats.map((stat, index) => (
        <Col key={index} sm={colWidth}>
          <StatsCard
            label={stat.label}
            value={stat.value}
            footer={stat.footer}
          />
        </Col>
      ))}
    </Row>
  );
};
