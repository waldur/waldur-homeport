import { ProgressBar } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const QuotaCell = ({ usage, limit, units, title, description }) => {
  const percent = Math.round((usage / limit) * 100);
  return (
    <tr className="pb-1">
      <td>{title}</td>
      <td style={{ padding: 0 }}>
        <ProgressBar
          variant={
            percent < 33 ? 'success' : percent < 66 ? 'warning' : 'danger'
          }
          now={percent}
          style={{ padding: 0, width: 150 }}
          className="h-6px"
        />
      </td>{' '}
      <td>
        {translate('{usage} out of {limit} {units}', { usage, limit, units })}{' '}
        {description && (
          <Tip id="quota" label={description}>
            <i className="fa fa-question-circle" />
          </Tip>
        )}
      </td>
    </tr>
  );
};
