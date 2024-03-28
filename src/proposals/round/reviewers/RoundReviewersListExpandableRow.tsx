import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

export const RoundReviewersListExpandableRow: FunctionComponent<{
  row;
}> = ({ row }) => (
  <>
    <table className="table">
      <thead>
        <tr>
          <td>{translate('In progress')}</td>
          <td>{translate('Accepted')}</td>
          <td>{translate('Rejected')}</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{row.in_review_proposals}</td>
          <td>{row.accepted_proposals}</td>
          <td>{row.rejected_proposals}</td>
        </tr>
      </tbody>
    </table>
  </>
);
