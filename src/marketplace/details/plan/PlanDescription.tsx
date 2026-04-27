import { FormattedHtml } from '@/core/FormattedHtml';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface PlanDescriptionProps {
  resolve: {
    plan_description: string;
  };
}

export const PlanDescription = (props: PlanDescriptionProps) => (
  <ModalDialog
    title={translate('Plan description')}
    footer={<CloseDialogButton label={translate('Ok')} />}
  >
    <FormattedHtml html={props.resolve.plan_description} />
  </ModalDialog>
);
