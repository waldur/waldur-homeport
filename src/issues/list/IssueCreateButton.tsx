import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { openIssueCreateDialog } from '../create/actions';

export interface IssueCreateButtonProps {
  scope: any;
  scopeType: string;
  refetch: () => void;
}

export const IssueCreateButton: FunctionComponent<IssueCreateButtonProps> = (
  resolve,
) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(openIssueCreateDialog(resolve));
  };

  return (
    <ActionButton
      title={translate('Create')}
      action={handleClick}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
