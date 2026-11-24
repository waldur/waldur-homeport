import { CopySimpleIcon } from '@phosphor-icons/react';
import { ProviderOffering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { isSiteAgentOfferingType } from '@/site-agent/constants';
import { useUser } from '@/workspace/hooks';

const SaveAsTemplateDialog = lazyComponent(() =>
  import('./SaveAsTemplateDialog').then((module) => ({
    default: module.SaveAsTemplateDialog,
  })),
);

interface SaveAsTemplateActionProps {
  row: ProviderOffering;
  refetch?: () => void;
}

/**
 * Turns a site-agent offering into an offering template. Templates are
 * administered by staff, and only site-agent offerings can be templated for
 * now: the API refuses the others.
 */
export const SaveAsTemplateAction = ({ row }: SaveAsTemplateActionProps) => {
  const user = useUser();
  const { openDialog } = useModal();

  if (!user?.is_staff || !isSiteAgentOfferingType(row.type)) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Save as template')}
      action={() =>
        openDialog(SaveAsTemplateDialog, {
          resolve: { offering: row },
        })
      }
      iconNode={<CopySimpleIcon weight="bold" />}
      staff
    />
  );
};
