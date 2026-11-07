import { FC } from 'react';
import { Form } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { outcomeLabel } from '@/proposals/workflow/constants';

interface DryRunOutcomeDialogProps {
  resolve: {
    title: string;
    submitLabel: string;
    outcomes: string[];
    onSubmit(outcome: string): void;
  };
}

/**
 * The outcome of a dry run's step or contribution, picked as a real
 * proposal's is (CompleteWorkflowStepDialog): nothing is sent, the path
 * gets one more action.
 */
export const DryRunOutcomeDialog: FC<DryRunOutcomeDialogProps> = ({
  resolve: { title, submitLabel, outcomes, onSubmit },
}) => {
  const { closeDialog } = useModal();
  return (
    <Form<{ outcome?: string }>
      onSubmit={(values) => {
        onSubmit(values.outcome);
        closeDialog();
      }}
    >
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={title}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton submitting={false} label={submitLabel} />
              </>
            }
          >
            <SelectGroup
              label={translate('Outcome')}
              name="outcome"
              options={outcomes.map((value) => ({
                value,
                label: outcomeLabel(value),
              }))}
              simpleValue
              required
              validate={required}
              placeholder={translate('Select an outcome...')}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
