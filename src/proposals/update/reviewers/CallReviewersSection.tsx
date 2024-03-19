import React, { useState } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import {
  StepCardTabs,
  TabSpec,
} from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { Call } from '@waldur/proposals/types';

import { CallInvitationsList } from './CallInvitationsList';
import { CallPermissionsLogList } from './CallPermissionsLogList';
import { CallUsersList } from './CallUsersList';

const tabs: TabSpec<{ call: Call }>[] = [
  { title: translate('Users'), key: 'users', component: CallUsersList },
  {
    title: translate('Permission log'),
    key: 'permissions',
    component: CallPermissionsLogList,
  },
  {
    title: translate('Invitations'),
    key: 'invitations',
    component: CallInvitationsList,
  },
];

export const CallReviewersSection = ({ call }) => {
  const [tab, setTab] = useState<TabSpec<{ call: Call }>>(tabs[0]);

  return (
    <Card className="mb-7" id="reviewers">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Reviewers')}</h3>
        </Card.Title>
        <div className="card-toolbar flex-grow-1 ms-6">
          <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
        </div>
      </Card.Header>
      <Card.Body className="p-0 min-h-550px">
        {React.createElement(tab.component, { call })}
      </Card.Body>
    </Card>
  );
};
