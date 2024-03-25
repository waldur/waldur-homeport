import React, { FC, useState } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { GenericInvitationContext } from '@waldur/invitations/types';
import {
  StepCardTabs,
  TabSpec,
} from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { PermissionsLogList } from '@waldur/permissions/PermissionsLogList';

import { InvitationsList } from './InvitationsList';
import { UsersList } from './UsersList';

const tabs: TabSpec<GenericInvitationContext>[] = [
  { title: translate('Users'), key: 'users', component: UsersList },
  {
    title: translate('Permission log'),
    key: 'permissions',
    component: PermissionsLogList,
  },
  {
    title: translate('Invitations'),
    key: 'invitations',
    component: InvitationsList,
  },
];

export const TeamSection: FC<GenericInvitationContext & { title: string }> = (
  props,
) => {
  const [tab, setTab] = useState<TabSpec<GenericInvitationContext>>(tabs[0]);

  return (
    <Card className="mb-7" id="reviewers">
      <Card.Header>
        <Card.Title>
          <h3>{props.title}</h3>
        </Card.Title>
        <div className="card-toolbar flex-grow-1 ms-6">
          <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
        </div>
      </Card.Header>
      <Card.Body className="p-0 min-h-550px">
        {React.createElement(tab.component, props)}
      </Card.Body>
    </Card>
  );
};
