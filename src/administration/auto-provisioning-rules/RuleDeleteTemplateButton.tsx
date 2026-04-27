import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { autoprovisioningRulesPartialUpdate } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const RuleDeleteTemplateButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to remove the template of rule {name}?',
          { name: <strong>{row.name}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await autoprovisioningRulesPartialUpdate({
        path: { uuid: row.uuid },
        body: {
          plan_attributes: {},
          plan_limits: {},
          plan: null,
          project_role_name: row.project_role_display_name,
        },
      });
      dispatch(showSuccess(translate('Template removed')));
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to remove template.')));
    }
  };

  return (
    <ActionItem
      title={translate('Remove template')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
