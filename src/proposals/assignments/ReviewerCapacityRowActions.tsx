import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { CallReviewerPool } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

interface ReviewerCapacityRowActionsProps {
  row: CallReviewerPool;
  onEdit: () => void;
}

export const ReviewerCapacityRowActions: FC<
  ReviewerCapacityRowActionsProps
> = ({ onEdit }) => {
  return (
    <ActionsDropdownComponent>
      <ActionItem
        title={translate('Edit capacity')}
        action={onEdit}
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
    </ActionsDropdownComponent>
  );
};
