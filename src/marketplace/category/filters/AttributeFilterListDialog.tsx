import { FunctionComponent } from 'react';

import { ResetFormButton } from '@waldur/form/ResetFormButton';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { MARKETPLACE_FILTER_FORM } from '../store/constants';

import { AttributeFilterListContainer } from './AttributeFilterListContainer';

export const AttributeFilterListDialog: FunctionComponent<{}> = () => (
  <ModalDialog
    title={translate('Attributes filter')}
    footer={[
      <CloseDialogButton
        key={1}
        label={translate('Apply')}
        className="btn btn-primary"
      />,
      <ResetFormButton key={2} formName={MARKETPLACE_FILTER_FORM} />,
      <CloseDialogButton key={3} />,
    ]}
  >
    <AttributeFilterListContainer />
  </ModalDialog>
);
