import { FC, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';

import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';
import { GenericInvitationContext } from '@waldur/invitations/types';
import {
  StepCardTabs,
  TabSpec,
} from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { FieldReviewComments } from '../proposal/create-review/FieldReviewComments';
import { ProposalReview } from '../types';

import { AddUserButton } from './AddUserButton';
import { InvitationsList } from './InvitationsList';
import { UsersList } from './UsersList';

const tabs: TabSpec<GenericInvitationContext>[] = [
  {
    title: translate('Users'),
    key: 'users',
  },
  {
    title: translate('Permission log'),
    key: 'permissions',
  },
  {
    title: translate('Invitations'),
    key: 'invitations',
  },
];

export const TeamSection: FC<
  GenericInvitationContext & {
    title: string;
    change?(field: string, value: any): void;
    reviews?: ProposalReview[];
  }
> = (props) => {
  const hideRole = props.roles && props.roles.length === 1;

  const [tab, setTab] = useState<TabSpec<GenericInvitationContext>>(tabs[0]);
  const usersFilter = useMemo(
    () => ({
      role: props.roles,
    }),
    [props.roles],
  );
  const usersTable = useTable({
    table: `UserList${props.title}`,
    fetchData: createFetcher(`${props.scope.url}list_users`),
    filter: usersFilter,
    onFetch(rows) {
      if (props.change) {
        props.change('users', rows);
      }
    },
  });

  const invitationsFilter = useMemo(
    () => ({ scope: props.scope.url }),
    [props.scope],
  );
  const invitationsTable = useTable({
    table: `UserInvitations${props.title}`,
    fetchData: createFetcher('user-invitations'),
    queryField: 'email',
    filter: invitationsFilter,
  });

  const eventsFilter = useMemo(
    () => ({
      scope: props.scope.url,
      event_type: ['role_granted', 'role_revoked', 'role_updated'],
    }),
    [props.scope],
  );

  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{props.title}</h3>
        </Card.Title>
        <div className="card-toolbar row flex-grow-1">
          <div className="col">
            <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
          </div>
          <div className="col d-flex justify-content-end text-nowrap">
            <AddUserButton refetch={usersTable.fetch} {...props} />
            &nbsp;
            <InvitationCreateButton
              {...props}
              refetch={invitationsTable.fetch}
            />
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0 min-h-550px">
        {tab.key === 'users' && (
          <UsersList
            table={usersTable}
            scope={props.scope}
            hideRole={hideRole}
          />
        )}
        {tab.key === 'invitations' && (
          <InvitationsList table={invitationsTable} hideRole={hideRole} />
        )}
        {tab.key === 'permissions' && (
          <BaseEventsList
            table={`permissions-log${props.scope.url}`}
            filter={eventsFilter}
          />
        )}

        <FieldReviewComments reviews={props.reviews} fieldName="comment_team" />
      </Card.Body>
    </Card>
  );
};
