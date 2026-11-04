import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

import { canOfferProjectCreate } from '../canOfferProjectCreate';

const ProjectCreateDialog = lazyComponent(() =>
  import('./ProjectCreateDialog').then((module) => ({
    default: module.ProjectCreateDialog,
  })),
);

export const GlobalProjectCreateButton: FC<{ refetch }> = ({ refetch }) => {
  const user = useUser();
  const { openDialog } = useModal();
  if (!canOfferProjectCreate(user)) {
    return null;
  }
  return (
    <BaseButton
      label={translate('Add')}
      onClick={() =>
        openDialog(ProjectCreateDialog, {
          size: 'lg',
          formId: 'projectCreate',
          refetch,
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
      size="lg"
    />
  );
};
