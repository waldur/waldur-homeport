import * as React from 'react';

import { ResetFormButton } from '@waldur/form-react/ResetFormButton';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { MARKETPLACE_FILTER_FORM } from '@waldur/marketplace/list/store/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import AttributeFilterListContainer from './AttributeFilterListContainer';

const PureAttributeFilterListDialog = (props: TranslateProps) => {
  return (
    <ModalDialog title={props.translate('Attributes filter')}
      footer={[
        <CloseDialogButton key={1} label={props.translate('Apply')} className="btn btn-primary"/>,
        <ResetFormButton key={2} formName={MARKETPLACE_FILTER_FORM} />,
        <CloseDialogButton key={3}/>,
      ]}>
      <AttributeFilterListContainer />
    </ModalDialog>
  );
};

export const AttributeFilterListDialog = withTranslation(PureAttributeFilterListDialog);
export default connectAngularComponent(AttributeFilterListDialog);
