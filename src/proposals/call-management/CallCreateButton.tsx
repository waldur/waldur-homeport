import { FileIcon, StackIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { callManagingOrganisationsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { useUser, useCustomer } from '@/workspace/hooks';

const CallCreateDialog = lazyComponent(() =>
  import('./CallFormDialog').then((module) => ({
    default: module.CallFormDialog,
  })),
);

const CreateCallFromTemplateDialog = lazyComponent(() =>
  import('../templates/CreateCallFromTemplateDialog').then((module) => ({
    default: module.CreateCallFromTemplateDialog,
  })),
);

export const CallCreateButton = ({ refetch }) => {
  const user = useUser();
  const customer = useCustomer();
  const managerUuid = customer?.call_managing_organization_uuid;
  const canCreateCall = hasPermission(user, {
    permission: PermissionEnum.CREATE_CALL,
    callOrganizerId: managerUuid,
  });
  const { openDialog } = useModal();

  // A call belongs to a managing organisation, so there is nothing to create
  // from a cross-organisation list. The organisation's own Call management tab
  // is where a call is started.
  if (!customer || !canCreateCall) {
    return null;
  }

  return (
    <ActionsMenu
      side="bottom"
      toggle="add"
      label={translate('Create call')}
      size="lg"
      align="start"
    >
      <ActionItem
        title={translate('Blank call')}
        iconNode={<FileIcon weight="bold" />}
        action={() =>
          openDialog(CallCreateDialog, {
            resolve: { refetch },
            size: 'lg',
          })
        }
      />
      {managerUuid && (
        <ActionItem
          title={translate('From template')}
          iconNode={<StackIcon weight="bold" />}
          action={() =>
            openDialog(CreateCallFromTemplateDialog, {
              resolve: { managerUuid, refetch },
              size: 'xl',
            })
          }
        />
      )}
    </ActionsMenu>
  );
};

/**
 * Creating a call from Manage calls, which lists the calls of every
 * organisation the user runs calls for: a call is created in one of them,
 * so the menu names the organisation where there is more than one.
 */
export const ManageCallsCreateButton = ({ refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();
  const { data: organisations } = useQuery({
    queryKey: ['CallManagingOrganisationsForCreate', user?.uuid],
    queryFn: () =>
      getAllPages((page) =>
        callManagingOrganisationsList({
          query: { page, page_size: MAX_PAGE_SIZE },
        }),
      ),
    enabled: Boolean(user),
    refetchOnWindowFocus: false,
  });
  const allowed = (organisations ?? []).filter((organisation) =>
    hasPermission(user, {
      permission: PermissionEnum.CREATE_CALL,
      callOrganizerId: organisation.uuid,
    }),
  );
  if (!allowed.length) {
    return null;
  }
  const named = allowed.length > 1;
  return (
    <ActionsMenu
      side="bottom"
      toggle="add"
      label={translate('Create call')}
      size="lg"
      align="start"
    >
      {allowed.map((organisation) => (
        <Fragment key={organisation.uuid}>
          <ActionItem
            title={
              named
                ? translate('Blank call in {organization}', {
                    organization: organisation.customer_name,
                  })
                : translate('Blank call')
            }
            iconNode={<FileIcon weight="bold" />}
            action={() =>
              openDialog(CallCreateDialog, {
                resolve: { refetch, customerUuid: organisation.customer_uuid },
                size: 'lg',
              })
            }
          />
          <ActionItem
            title={
              named
                ? translate('From template in {organization}', {
                    organization: organisation.customer_name,
                  })
                : translate('From template')
            }
            iconNode={<StackIcon weight="bold" />}
            action={() =>
              openDialog(CreateCallFromTemplateDialog, {
                resolve: { managerUuid: organisation.uuid, refetch },
                size: 'xl',
              })
            }
          />
        </Fragment>
      ))}
    </ActionsMenu>
  );
};
