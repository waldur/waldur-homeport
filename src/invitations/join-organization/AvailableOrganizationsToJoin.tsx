import { LockOpenIcon, XIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { GroupInvitation } from 'waldur-js-client';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs } from '@waldur/navigation/context';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { showRedirectMessage } from '@waldur/store/notify';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { useUser } from '@waldur/workspace/hooks';

import { setGroupInvitationToken } from '../InvitationStorage';

import { GroupInvitationCard } from './GroupInvitationCard';
import { requestToAccessOrganization } from './submission';

const filter = {
  is_active: true,
};

export const AvailableOrganizationsToJoin: FC = () => {
  const dispatch = useDispatch();

  const user = useUser();

  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  const tableProps = useTable({
    table: 'PublicGroupInvitations',
    filter,
    fetchData: createFetcher('user-group-invitations'),
    queryField: 'name',
  });

  const onSubmit = useCallback(
    (formData) => {
      return requestToAccessOrganization(formData.invitation.uuid, dispatch);
    },
    [dispatch],
  );

  const router = useRouter();
  const continueToAutentification = useCallback(
    (invitation: GroupInvitation) => {
      dispatch(
        showRedirectMessage(
          translate('You are requesting to join {name}', {
            name: invitation.customer_name,
          }),
          translate('Log in to proceed with your request.'),
        ),
      );
      setGroupInvitationToken(invitation.uuid);
      router.stateService.go('login');
    },
    [router],
  );

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    return user
      ? [
          {
            key: 'dashboard',
            text: translate('Profile'),
            to: 'profile.details',
          },
        ]
      : [
          {
            key: 'login',
            text: translate('Log in'),
            to: 'login',
          },
        ];
  }, [user, router]);

  useBreadcrumbs(breadcrumbItems);

  return (
    <Form<{ invitation: GroupInvitation }> onSubmit={onSubmit}>
      {({ invalid, handleSubmit, submitting, values, form }) => (
        <form onSubmit={handleSubmit}>
          <Table<GroupInvitation>
            {...tableProps}
            title={translate('Available organizations to join')}
            subtitle={translate(
              'Select an organization to join and request access.',
            )}
            verboseName={translate('Group')}
            hasQuery
            gridSize={{ sm: 6, xl: 4 }}
            gridItem={GroupInvitationCard}
            hoverShadow={{ grid: false }}
            initialMode="grid"
            hideRefresh
            standalone
            standaloneActionsInTable
            tableActions={
              <div className="anonymous-join-organization-action d-flex align-items-center w-100">
                {values?.invitation?.uuid ? (
                  <>
                    <Button
                      variant="text"
                      size="sm"
                      className="btn-icon btn-no-focus btn-icon-gray-700 btn-active-icon-danger me-2"
                      onClick={() => form.change('invitation', null)}
                    >
                      <span className="svg-icon svg-icon-3">
                        <XIcon weight="bold" />
                      </span>
                    </Button>
                    <div className="d-flex flex-wrap fs-6 ellipsis">
                      <span className="fw-normal me-1">
                        {translate('Selected organization')}:
                      </span>
                      <b className="ellipsis mw-lg-200px mw-xl-300px">
                        {values.invitation.customer_name}
                      </b>
                    </div>
                  </>
                ) : null}
                {user ? (
                  <SubmitButton
                    submitting={submitting}
                    disabled={invalid}
                    className="btn btn-primary ms-6"
                  >
                    <span className="svg-icon svg-icon-2">
                      <LockOpenIcon weight="bold" />
                    </span>
                    {translate('Request access')}
                  </SubmitButton>
                ) : values?.invitation?.uuid ? (
                  <Button
                    className="ms-6"
                    size={isSmallScr ? 'sm' : undefined}
                    onClick={() => continueToAutentification(values.invitation)}
                  >
                    {translate('Continue to autentification')}
                  </Button>
                ) : null}
              </div>
            }
          />
        </form>
      )}
    </Form>
  );
};
