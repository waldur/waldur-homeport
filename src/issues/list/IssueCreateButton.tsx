import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, ReactNode } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ISSUE_CREATION_FORM_ID } from '@/issues/create/constants';
import { useModal } from '@/modal/actions';

const IssueCreateDialog = lazyComponent(() =>
  import('@/issues/create/IssueCreateDialog').then((module) => ({
    default: module.IssueCreateDialog,
  })),
);

export interface IssueCreateButtonProps {
  scope?: any;
  scopeType?: string;
  refetch?: () => void;
  issue?: any;
  options?: any;
  hideProjectAndResourceFields?: boolean;
  /** Shown under the description field. */
  descriptionNote?: ReactNode;
}

export const IssueCreateButton: FunctionComponent<IssueCreateButtonProps> = (
  resolve,
) => {
  const { openDialog } = useModal();

  return (
    <BaseButton
      label={translate('Create')}
      onClick={() => {
        openDialog(IssueCreateDialog, {
          resolve,
          dialogClassName: 'sm:max-w-[650px]',
          formId: ISSUE_CREATION_FORM_ID,
        });
      }}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
