import { FC } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface AsyncActionDialogProps {
  title: string;
  loading: boolean;
  error: any;
  submitting: boolean;
  invalid: boolean;
}

export const AsyncActionDialog: FC<AsyncActionDialogProps> = (props) => (
  <ModalDialog
    title={props.title}
    footer={
      <>
        <CloseDialogButton />
        <SubmitButton
          submitting={props.submitting}
          disabled={props.loading || props.invalid}
          label={translate('Submit')}
        />
      </>
    }
  >
    {props.loading ? (
      <LoadingSpinner />
    ) : props.error ? (
      <>{translate('Unable to load data.')}</>
    ) : (
      props.children
    )}
  </ModalDialog>
);
