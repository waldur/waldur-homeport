import * as React from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface PlanDescriptionProps extends TranslateProps {
  resolve: {
    plan_description: string;
  };
}

export const PlanDescription = withTranslation(
  (props: PlanDescriptionProps) => (
    <ModalDialog
      title={props.translate('Plan description')}
      footer={<CloseDialogButton />}
    >
      <FormattedHtml html={props.resolve.plan_description} />
    </ModalDialog>
  ),
);
