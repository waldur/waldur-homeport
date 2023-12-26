import { FC, useMemo } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ProposalCall } from '@waldur/proposals/types';

import { EditReviewInfoButton } from './EditReviewInfoButton';

interface CallReviewSectionProps {
  call: ProposalCall;
}

export const CallReviewSection: FC<CallReviewSectionProps> = ({ call }) => {
  const tableRows = useMemo(() => {
    return [
      { label: translate('Review strategy'), value: call.review_strategy },
      {
        label: translate('Allocation strategy'),
        value: call.allocation_strategy,
      },
      { label: translate('Approval threshold score'), value: '3.6+' },
    ];
  }, [call]);
  return (
    <Card id="review" className="mb-7">
      <Card.Header className="border-2 border-bottom">
        <Card.Title>
          {tableRows.length === 0 ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          <span>{translate('Review')}</span>
        </Card.Title>
        <div className="card-toolbar">
          <EditReviewInfoButton />
        </div>
      </Card.Header>
      <Card.Body>
        {tableRows.length === 0 ? (
          <div className="justify-content-center row">
            <div className="col-sm-4">
              <p className="text-center">{translate('Nothing to see here.')}</p>
            </div>
          </div>
        ) : (
          <Table bordered={true} hover={true} responsive={true}>
            <thead>
              <tr className="bg-light">
                <th>{translate('Configuration key')}</th>
                <th>{translate('Value')}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((item, index) => (
                <tr key={index}>
                  <td className="col-md-3">{item.label}</td>
                  <td className="col-md-3">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};
