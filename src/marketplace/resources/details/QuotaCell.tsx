import { ProgressBar, Col } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const QuotaCell = ({ usage, limit, units, title, description }) => {
  const percent = Math.round((usage / limit) * 100);
  return (
    <Col sm={6}>
      <div className="text-center text-dark py-3">
        {translate('{usage} out of {limit} {units}', { usage, limit, units })}{' '}
        {description && (
          <Tip id="quota" label={description}>
            <i className="fa fa-question-circle" />
          </Tip>
        )}
      </div>
      <ProgressBar
        variant={percent < 50 ? 'success' : 'danger'}
        now={percent}
      />
      <div className="text-center text-muted py-3">{title}</div>
    </Col>
  );
};
