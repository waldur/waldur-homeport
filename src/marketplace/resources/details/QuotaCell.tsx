import { ProgressBar } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const QuotaCell = ({ usage, limit, units, title, description }) => {
  const percent = Math.round((usage / limit) * 100);
  return (
    <tr>
      <td>{title}</td>
      <td>
        <ProgressBar
          variant={
            percent < 33 ? 'success' : percent < 66 ? 'warning' : 'danger'
          }
          now={percent}
          style={{ width: 100 }}
          className="h-6px mt-2"
        />
      </td>
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
