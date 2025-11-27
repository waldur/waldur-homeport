import { FC } from 'react';

import { CopyToClipboard } from '@waldur/core/CopyToClipboard';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

type OwnProps = { resolve: { offering: Offering; config: string } };

export const GLAuthConfigDialog: FC<OwnProps> = (props) => {
  const hasValue =
    props.resolve.config && typeof props.resolve.config === 'string';

  return (
    <ModalDialog
      title={translate('GLAuth configuration for {offering}', {
        offering: props.resolve.offering.name,
      })}
      actions={
        hasValue && (
          <CopyToClipboard
            value={props.resolve.config}
            label={translate('Copy')}
            className="btn-tertiary w-150px"
          />
        )
      }
      footer={
        <CloseDialogButton label={translate('Close')} className="w-150px" />
      }
    >
      {hasValue ? (
        <MonacoField
          input={{ onChange: null, value: props.resolve.config }}
          readOnly
        />
      ) : (
        <p className="text-quaternary">
          {translate('No configuration has been set.')}
        </p>
      )}
    </ModalDialog>
  );
};
