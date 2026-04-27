import { FC, PropsWithChildren } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface AsyncActionDialogProps {
  title: string;
  loading: boolean;
  error: any;
  submitting: boolean;
  invalid: boolean;
}

export const AsyncActionDialog: FC<
  PropsWithChildren<AsyncActionDialogProps>
> = (props) => (
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
