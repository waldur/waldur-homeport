import { FC, PropsWithChildren } from 'react';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

interface AsyncActionDialogProps {
  title: string;
  loading: boolean;
  error: any;
}

export const AsyncActionDialog: FC<
  PropsWithChildren<AsyncActionDialogProps>
> = (props) => (
  <ModalDialog title={props.title} footer={<FormFooter />}>
    {props.loading ? (
      <LoadingSpinner />
    ) : props.error ? (
      <>{translate('Unable to load data.')}</>
    ) : (
      props.children
    )}
  </ModalDialog>
);
