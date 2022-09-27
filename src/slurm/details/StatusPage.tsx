import { range } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

export const StatusPage = () => (
  <div className="text-center">
    <h5>
      <i
        className="text-dark fa fa-check-circle mb-3"
        style={{ fontSize: '4rem' }}
      />
      <p>{translate('No reported incidents in the last 24 hours')}</p>
    </h5>
    <div className="d-flex justify-content-between mb-3">
      <div>{translate('Reported incidents')}</div>
      <div>{translate('Operational')}</div>
    </div>
    <div className="d-flex justify-content-between mb-3" style={{ gap: 5 }}>
      {range(20).map((index) => (
        <div
          key={index}
          style={{ background: 'gray', width: 15, height: 30 }}
        />
      ))}
    </div>
    <div className="d-flex justify-content-between text-muted">
      <div>{translate('90 days ago')}</div>
      <div>{translate('99.98% uptime')}</div>
      <div>{translate('Today')}</div>
    </div>
  </div>
);
