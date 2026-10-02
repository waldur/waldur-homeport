import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

import { canUpdateResourceOptions } from './permissions';
import { UpdateResourceOptionDialogProps } from './UpdateResourceOptionDialog';

const UpdateResourceOptionDialog = lazyComponent(() =>
  import('./UpdateResourceOptionDialog').then((module) => ({
    default: module.UpdateResourceOptionDialog,
  })),
);

export const UpdateResourceOptionButton: FunctionComponent<
  UpdateResourceOptionDialogProps['resolve']
> = (props) => {
  const user = useUser();
  // A formula input changes limits, so it is always ordered, and its dialog
  // needs the width of the limits table it previews.
  const isFormula = props.option.type === 'component_formula';
  const hasPerms = canUpdateResourceOptions(user, props.resource, {
    forceOrder: isFormula,
  });
  const isResourceOk = props.resource.state === 'OK';
  const disabled = !hasPerms || !isResourceOk;

  const { openDialog } = useModal();
  const callback = () => {
    openDialog(UpdateResourceOptionDialog, {
      resolve: props,
      size: isFormula ? 'xl' : undefined,
    });
  };

  let tooltip: string | undefined;
  if (disabled) {
    if (!isResourceOk) {
      tooltip = translate(
        'Options cannot be edited while resource is being updated.',
      );
    } else if (!hasPerms) {
      tooltip = translate(
        "You don't have enough privileges to perform this operation.",
      );
    }
  }

  return (
    <BaseButton
      onClick={callback}
      disabled={disabled}
      tooltip={tooltip}
      iconNode={<PencilSimpleIcon weight="bold" />}
      label={translate('Edit')}
      iconRight
      variant="tertiary"
      size="sm"
    />
  );
};
