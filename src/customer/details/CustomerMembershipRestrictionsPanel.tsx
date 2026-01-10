import { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  getRestrictionsArray,
  RestrictionField,
  RestrictionsValue,
} from '@waldur/core/restrictions';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { getInitialValues } from './restrictions/EditMembershipRestrictionsDialog';

interface CustomerMembershipRestrictionsPanelProps {
  customer: Customer;
}

const EditMembershipRestrictionsDialog = lazyComponent(() =>
  import('./restrictions/EditMembershipRestrictionsDialog').then((module) => ({
    default: module.EditMembershipRestrictionsDialog,
  })),
);

export const CustomerMembershipRestrictionsPanel: FC<
  CustomerMembershipRestrictionsPanelProps
> = ({ customer }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const canEdit = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: customer.uuid,
  });

  const emailPatterns = getRestrictionsArray(customer.user_email_patterns);
  const affiliations = getRestrictionsArray(customer.user_affiliations);
  const identitySources = getRestrictionsArray(customer.user_identity_sources);

  const openEditDialog = useCallback(
    (field: RestrictionField) => {
      dispatch(
        openModalDialog(EditMembershipRestrictionsDialog, {
          resolve: { customer, field },
          initialValues: getInitialValues(customer, field),
        }),
      );
    },
    [dispatch, customer],
  );

  return (
    <div className="p-6">
      <FormTable>
        <FormTable.Item
          label={translate('Email patterns')}
          description={translate(
            'Users whose email matches any of these regex patterns will be allowed.',
          )}
          value={<RestrictionsValue values={emailPatterns} />}
          actions={
            canEdit && (
              <CompactEditButton
                onClick={() => openEditDialog('user_email_patterns')}
              />
            )
          }
        />
        <FormTable.Item
          label={translate('User affiliations')}
          description={translate(
            'Users with any of these affiliations will be allowed.',
          )}
          value={<RestrictionsValue values={affiliations} />}
          actions={
            canEdit && (
              <CompactEditButton
                onClick={() => openEditDialog('user_affiliations')}
              />
            )
          }
        />
        <FormTable.Item
          label={translate('Identity sources')}
          description={translate(
            'Users authenticated via any of these identity providers will be allowed.',
          )}
          value={<RestrictionsValue values={identitySources} />}
          actions={
            canEdit && (
              <CompactEditButton
                onClick={() => openEditDialog('user_identity_sources')}
              />
            )
          }
        />
      </FormTable>
    </div>
  );
};
