import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Round } from '@waldur/proposals/types';

import { EditReviewersButton } from './EditReviewersButton';

interface RoundReviewersSectionProps {
  round: Round;
}

const dummyData = [
  {
    reviewer: 'User 1',
    type: 'Technical reviewer',
    proposal: '24 open / 204 closed',
  },
  {
    reviewer: 'User 2',
    type: 'Technical reviewer',
    proposal: '24 open / 204 closed',
  },
  {
    reviewer: 'User 3',
    type: 'Technical reviewer',
    proposal: '24 open / 204 closed',
  },
];

export const RoundReviewersSection: FC<RoundReviewersSectionProps> = () => {
  return (
    <Card id="reviewers" className="mb-7">
      <Card.Header>
        <Card.Title>{translate('Reviewers')}</Card.Title>
        <div className="card-toolbar">
          <EditReviewersButton />
        </div>
      </Card.Header>
      <Card.Body>
        {dummyData.length === 0 ? null : (
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
