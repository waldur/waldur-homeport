import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface PlanDescriptionProps {
  resolve: {
    plan_description: string;
  };
}

export const PlanDescription = (props: PlanDescriptionProps) => (
  <ModalDialog
    title={translate('Plan description')}
    footer={<CloseDialogButton />}
  >
    <FormattedHtml html={props.resolve.plan_description} />
  </ModalDialog>
);
