import { LockOpenIcon, XIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { GroupInvitation, userGroupInvitationsList } from 'waldur-js-client';

import { GRID_BREAKPOINTS } from '@/core/constants';
import { GroupInvitationTokenStorage } from '@/core/StorageManager';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useBreadcrumbs } from '@/navigation/context';
import { IBreadcrumbItem } from '@/navigation/types';
import { showRedirectMessage } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { createFetcher } from '@/table/api';
import { CompactActionButton } from '@/table/CompactActionButton';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { GroupInvitationCard } from './GroupInvitationCard';
import { requestToAccessOrganization } from './submission';

const filter = {
  is_active: true,
  is_public: true,
};

export const AvailableOrganizationsToJoin: FC = () => {
  const dispatch = useDispatch();

  const user = useUser();

  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  const tableProps = useTable({
    table: 'PublicGroupInvitations',
    filter,
    fetchData: createFetcher(userGroupInvitationsList),
    queryField: 'name',
  });

  const onSubmit = useCallback(
    (formData) => {
      return requestToAccessOrganization(formData.invitation, dispatch);
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
      GroupInvitationTokenStorage.set(invitation.uuid);
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
                    <CompactActionButton
                      action={() => form.change('invitation', null)}
                      iconNode={<XIcon weight="bold" />}
                      variant="secondary"
                      className="btn-no-focus btn-icon-gray-700 btn-active-icon-danger me-2"
                    />
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
                    disabled={invalid || !values?.invitation?.uuid}
                    className="btn btn-primary ms-6"
                  >
                    <span className="svg-icon svg-icon-2">
                      <LockOpenIcon weight="bold" />
                    </span>
                    {translate('Request access')}
                  </SubmitButton>
                ) : values?.invitation?.uuid ? (
                  isSmallScr ? (
                    <CompactActionButton
                      action={() =>
                        continueToAutentification(values.invitation)
                      }
                      title={translate('Continue to autentification')}
                      variant="primary"
                      className="ms-6"
                    />
                  ) : (
                    <ActionButton
                      action={() =>
                        continueToAutentification(values.invitation)
                      }
                      title={translate('Continue to autentification')}
                      variant="primary"
                      className="ms-6"
                    />
                  )
                ) : null}
              </div>
            }
          />
        </form>
      )}
    </Form>
  );
};
