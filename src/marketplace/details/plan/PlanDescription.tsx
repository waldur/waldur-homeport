import * as React from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

interface PlanDescriptionProps extends TranslateProps {
  resolve: {
    plan_description: string;
  };
}

const PlanDescription = withTranslation((props: PlanDescriptionProps) => (
  <ModalDialog
    title={props.translate('Plan description')}
    footer={<CloseDialogButton />}
  >
    <FormattedHtml html={props.resolve.plan_description} />
  </ModalDialog>
));

export default connectAngularComponent(PlanDescription, ['resolve']);
