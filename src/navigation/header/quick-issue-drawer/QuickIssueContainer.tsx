import React from 'react';

import { UserIssuesTable } from './UserIssuesTable';

export const QuickIssueContainer: React.FC = () => {
  return (
    <div className="mb-5">
      <UserIssuesTable />
    </div>
  );
};
