import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { ResourceSummary } from './ResourceSummary';

interface PureResourceSummaryModalProps extends TranslateProps {
  resolve: {
    resource: any,
  };
}

export const PureResourceSummaryModal = (props: PureResourceSummaryModalProps) => {
  const { resolve: { resource }, translate } = props;
  return (
    <ModalDialog
      title={translate('Details')}
      footer={<CloseDialogButton />}
    >
      <ResourceSummary resource={resource} />
    </ModalDialog>
  );
};

export const ResourceSummaryModal = withTranslation(PureResourceSummaryModal);

export default connectAngularComponent(ResourceSummaryModal, ['resolve']);
