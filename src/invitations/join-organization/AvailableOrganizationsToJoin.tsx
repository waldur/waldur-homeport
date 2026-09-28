import { LockOpenIcon, XIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useMediaQuery } from 'react-responsive';
import { GroupInvitation, userGroupInvitationsList } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { GRID_BREAKPOINTS } from '@/core/constants';
import { GroupInvitationTokenStorage } from '@/core/StorageManager';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useBreadcrumbs } from '@/navigation/context';
import { IBreadcrumbItem } from '@/navigation/types';
import { useNotify } from '@/store/notify';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { GroupInvitationCard } from './GroupInvitationCard';
import { useRequestToAccessOrganization } from './submission';

const filter = {
  is_active: true,
  is_public: true,
};

export const AvailableOrganizationsToJoin: FC = () => {
  const user = useUser();

  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  const tableProps = useTable({
    table: 'PublicGroupInvitations',
    filter,
    fetchData: createFetcher(userGroupInvitationsList),
    queryField: 'name',
  });

  const { request } = useRequestToAccessOrganization();

  const onSubmit = useCallback(
    async (formData) => {
      // Discard the boolean result — final-form expects undefined on success.
      await request(formData.invitation);
    },
    [request],
  );

  const router = useRouter();
  const { showRedirectMessage } = useNotify();
  const continueToAutentification = useCallback(
    (invitation: GroupInvitation) => {
      showRedirectMessage(
        translate('You are requesting to join {name}', {
          name: invitation.customer_name,
        }),
        translate('Log in to proceed with your request.'),
      );
      GroupInvitationTokenStorage.set(invitation.uuid);
      router.stateService.go('login');
    },
    [router, showRedirectMessage],
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
                    <BaseButton
                      onClick={() => form.change('invitation', null)}
                      iconNode={<XIcon weight="bold" />}
                      variant="secondary"
                      className="btn-no-focus me-2"
                      size="sm"
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
                    variant="primary"
                    className="ms-6"
                  >
                    <span className="svg-icon svg-icon-2">
                      <LockOpenIcon weight="bold" />
                    </span>
                    {translate('Request access')}
                  </SubmitButton>
                ) : values?.invitation?.uuid ? (
                  isSmallScr ? (
                    <BaseButton
                      onClick={() =>
                        continueToAutentification(values.invitation)
                      }
                      label={translate('Continue to autentification')}
                      variant="primary"
                      className="ms-6"
                      size="sm"
                    />
                  ) : (
                    <BaseButton
                      onClick={() =>
                        continueToAutentification(values.invitation)
                      }
                      label={translate('Continue to autentification')}
                      variant="primary"
                      className="ms-6"
                      size="lg"
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
