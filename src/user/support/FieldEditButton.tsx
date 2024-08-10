import { PencilSimple } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { EditUserProps } from '../types';

const EditFieldDialog = lazyComponent(
  () => import('./EditFieldDialog'),
  'EditFieldDialog',
);

export const FieldEditButton = (props: EditUserProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditFieldDialog, {
        resolve: props,
        size: 'sm',
      }),
    );
  };
  return (
    <ActionButton
      action={callback}
      iconNode={<PencilSimple weight="bold" />}
      variant="secondary"
      className="btn-sm btn-icon"
      disabled={props.disabled || props.protected}
      tooltip={
        props.protected
          ? props.protectedMsg
            ? props.protectedMsg
            : props.user.identity_provider_label
              ? translate('Information is coming from {identityProvider}', {
                  identityProvider: props.user.identity_provider_label,
                })
              : translate('Information is coming from identity provider')
          : undefined
      }
    />
  );
};
