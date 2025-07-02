import { useQueryClient } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';

import { TableTabsContainer } from '@waldur/customer/list/TableTabsContainer';
import { BaseEventsList } from '@waldur/events/BaseEventsList';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { GenericInvitationContext } from '@waldur/invitations/types';
import { RoleEnum } from '@waldur/permissions/enums';
import { createFetcher } from '@waldur/table/api';
import { TableTabs } from '@waldur/table/TableTabs';
import { useTable } from '@waldur/table/useTable';

import { CALL_REVIEWERS_QUERY_KEY } from '../constants';
import { AddCommentButton } from '../proposal/create-review/AddCommentButton';
import { FieldReviewComments } from '../proposal/create-review/FieldReviewComments';
import { ProposalReview } from '../types';

import { InvitationsList } from './InvitationsList';
import { TeamDropdownActions } from './TeamDropdownActions';
import { UsersList } from './UsersList';

export const TeamSection: FC<
  GenericInvitationContext & {
    title: string;
    change?(field: string, value: any): void;
    reviews?: ProposalReview[];
    onAddCommentClick?({ commentField, label }): void;
    readOnlyMode?: boolean;
    id?: string;
    hasTeamTabs?: boolean;
  }
> = (props) => {
  const queryClient = useQueryClient();
  const hideRole = props.roles && props.roles.length === 1;

  const usersFilter = useMemo(
    () => ({
      role: props.roles,
    }),
    [props.roles],
  );

  const url =
    props.roleTypes?.[0] === 'proposal'
      ? 'proposal-proposals/' + props.scope.uuid + '/list_users'
      : props.roleTypes?.[0] === 'call'
        ? 'proposal-protected-calls/' + props.scope.uuid + '/list_users'
        : undefined;

  const usersTable = useTable({
    table: `UserList${props.title}`,
    fetchData: createFetcher(url),
    filter: usersFilter,
    onFetch(rows) {
      if (props.change) {
        props.change('users', rows);
      }
      // Update query data for the call reviewers
      if (props.roles && props.roles.includes(RoleEnum.CALL_REVIEWER)) {
        const newReviewers = rows.filter(
          (row) => row.role_name === RoleEnum.CALL_REVIEWER,
        );
        queryClient.setQueryData(
          [CALL_REVIEWERS_QUERY_KEY, props.scope.uuid],
          newReviewers,
        );
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
    <Card className="card-bordered" id={props.id}>
      <Card.Header className="pt-4 pb-2">
        <Card.Title>
          <h3>{props.title}</h3>
        </Card.Title>
        <div className="card-toolbar gap-3">
          {!props.readOnlyMode ? (
            <TeamDropdownActions
              refetchUsers={usersTable.fetch}
              refetchInvitations={invitationsTable.fetch}
              {...props}
            />
          ) : props.onAddCommentClick ? (
            <AddCommentButton
              review={props.reviews?.[0]}
              onClick={() =>
                props.onAddCommentClick({
                  commentField: 'comment_team',
                  label: props.title,
                })
              }
            />
          ) : null}
        </div>
      </Card.Header>
      {props.hasTeamTabs &&
        !isFeatureVisible(MarketplaceFeatures.call_only) && (
          <Card.Header className="table-tabs border-bottom align-items-stretch py-0 min-h-auto">
            <TableTabs
              tabs={[
                {
                  key: 'reviewers',
                  title: translate('Reviewers'),
                  state: 'protected-call.main',
                  params: { tab: 'reviewers' },
                },
                {
                  key: 'managers',
                  title: translate('Managers'),
                  state: 'protected-call.main',
                  params: { tab: 'managers' },
                },
              ]}
            />
          </Card.Header>
        )}
      <Card.Body className="pt-0">
        <TableTabsContainer defaultActiveKey="users" className="min-h-175px">
          <div className="overflow-auto">
            <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
              <Nav.Item className="text-nowrap">
                <Nav.Link eventKey="users">{translate('Users')}</Nav.Link>
              </Nav.Item>
              <Nav.Item className="text-nowrap">
                <Nav.Link eventKey="invitations">
                  {translate('Invitations')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="text-nowrap">
                <Nav.Link eventKey="permissions">
                  {translate('Permissions')}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
          <Tab.Content className="overflow-auto">
            <Tab.Pane eventKey="users" unmountOnExit={true}>
              <UsersList
                table={usersTable}
                scope={props.scope}
                hideRole={hideRole}
                cardBordered={false}
                hasActionBar={false}
                fullWidth
              />
            </Tab.Pane>
            <Tab.Pane eventKey="invitations" unmountOnExit={true}>
              <InvitationsList
                table={invitationsTable}
                hideRole={hideRole}
                cardBordered={false}
                hasActionBar={false}
                fullWidth
              />
            </Tab.Pane>
            <Tab.Pane eventKey="permissions" unmountOnExit={true}>
              <BaseEventsList
                table={`permissions-log${props.scope.url}`}
                filter={eventsFilter}
                cardBordered={false}
                hasActionBar={false}
                fullWidth
                minHeight="auto"
              />
            </Tab.Pane>
          </Tab.Content>
        </TableTabsContainer>

        <FieldReviewComments
          reviews={props.reviews}
          fieldName="comment_team"
          space={0}
        />
      </Card.Body>
    </Card>
  );
};
