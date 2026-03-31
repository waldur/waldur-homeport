import { Table } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';

import { Call } from '../types';
import { getRoundsWithStatus } from '../utils';

interface CallDetailsHeaderBodyProps {
  call: Call;
}

export const CallDetailsHeaderBody = (props: CallDetailsHeaderBodyProps) => {
  if (isFeatureVisible(MarketplaceFeatures.call_only)) {
    return null;
  }
  const nextRound = getRoundsWithStatus(props.call.rounds)[0];
  return (
    <>
      {nextRound.status.label === 'Open' && (
        <Table className="mb-0 px-0 h-auto w-auto">
          <tbody>
            <tr>
              <th className="fw-bold w-125px p-0 pe-3 pb-1 text-nowrap">
                {translate('Open round started')}:
              </th>
              <td className="text-muted p-0 pb-1">
                {formatDateTime(nextRound.start_time)}
              </td>
            </tr>
            <tr>
              <th className="fw-bold w-125px p-0 pe-3 text-nowrap">
                {translate('Open round ends')}:
              </th>
              <td className="text-muted p-0">
                {formatDateTime(nextRound.cutoff_time)}
              </td>
            </tr>
          </tbody>
        </Table>
      )}
      {nextRound.status.label === 'Ended' && (
        <p className="text-danger">
          {translate('There are no open rounds. The call is closed.')}
        </p>
      )}
      {nextRound.status.label === 'Scheduled' && (
        <Table className="mb-0 px-0 h-auto w-auto">
          <tbody>
            <tr>
              <th className="fw-bold w-125px p-0 pe-3 pb-1 text-nowrap">
                {translate('Next round starts')}:
              </th>
              <td className="text-muted p-0 pb-1">
                {formatDateTime(nextRound.start_time)}
              </td>
            </tr>
            <tr>
              <th className="fw-bold w-125px p-0 pe-3 text-nowrap">
                {translate('Next round ends')}:
              </th>
              <td className="text-muted p-0">
                {formatDateTime(nextRound.cutoff_time)}
              </td>
            </tr>
          </tbody>
        </Table>
      )}
    </>
  );
};
