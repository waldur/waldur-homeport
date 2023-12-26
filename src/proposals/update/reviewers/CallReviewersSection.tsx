import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ProposalCall } from '@waldur/proposals/types';

import { EditReviewersButton } from './EditReviewersButton';

const dummyData = [
  {
    reviewer: translate('User 1'),
    type: 'Technical reviewer',
    proposal: '24 open / 204 closed',
  },
  {
    reviewer: translate('User 2'),
    type: 'Technical reviewer',
    proposal: '24 open / 204 closed',
  },
  {
    reviewer: translate('User 3'),
    type: 'Technical reviewer',
    proposal: '24 open / 204 closed',
  },
];

interface CallReviewersSectionProps {
  call: ProposalCall;
}

export const CallReviewersSection: FC<CallReviewersSectionProps> = () => {
  return (
    <Card id="reviewers" className="mb-7">
      <Card.Header className="border-2 border-bottom">
        <Card.Title>
          {dummyData.length === 0 ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          <span>{translate('Reviewers')}</span>
        </Card.Title>
        <div className="card-toolbar">
          <EditReviewersButton />
        </div>
      </Card.Header>
      <Card.Body>
        {dummyData.length === 0 ? (
          <div className="justify-content-center row">
            <div className="col-sm-4">
              <p className="text-center">{translate('Nothing to see here.')}</p>
            </div>
          </div>
        ) : (
          <Table bordered={true} hover={true} responsive={true}>
            <thead>
              <tr className="bg-light">
                <th>{translate('Reviewer')}</th>
                <th>{translate('Type')}</th>
                <th>{translate('Proposal')}</th>
              </tr>
            </thead>
            <tbody>
              {dummyData.map((item, index) => (
                <tr key={index}>
                  <td className="col-md-3">{item.reviewer}</td>
                  <td className="col-md-3">{item.type}</td>
                  <td className="col-md-3">{item.proposal}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};
