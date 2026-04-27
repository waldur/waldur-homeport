import { NotePencilIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RuleAddTemplateDialog = lazyComponent(() =>
  import('./RuleAddTemplateDialog').then((module) => ({
    default: module.RuleAddTemplateDialog,
  })),
);

export const RuleAddTemplateButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () =>
      dispatch(
        openModalDialog(RuleAddTemplateDialog, {
          resolve: {
            refetch,
            rule: row,
          },
          initialValues: {
            category: row.category_url
              ? {
                  url: row.category_url,
                  title: row.category_title,
                }
              : null,
            offering: row.offering_uuid
              ? {
                  uuid: row.offering_uuid,
                  name: row.offering_name,
                }
              : null,
            plan: row.plan
              ? {
                  url: row.plan,
                  name: row.plan_name,
                }
              : null,
            attributes: row.plan_attributes,
            limits: row.plan_limits,
          },
          size: 'lg',
          formId: 'RuleAddTemplateForm',
        }),
      ),
    [dispatch, row, refetch],
  );

  return (
    <ActionItem
      title={row.plan ? translate('Edit template') : translate('Add template')}
      iconNode={
        row.plan ? (
          <NotePencilIcon weight="bold" />
        ) : (
          <PlusCircleIcon weight="bold" />
        )
      }
      action={callback}
    />
  );
};
