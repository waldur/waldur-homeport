import { useMemo } from 'react';

import { Panel } from '@/core/Panel';
import { FloatingSubmitButton } from '@/form/FloatingSubmitButton';
import { FormSteps } from '@/form/FormSteps';
import { SidebarProps } from '@/form/SidebarProps';
import { TosNotification } from '@/form/TosNotification';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

interface CompletionPageSidebarProps extends SidebarProps {
  saveAsDraft(): void;
  isSaving?: boolean;
  editable?: boolean;
}

export const ProposalSidebar = (props: CompletionPageSidebarProps) => {
  // Check which required steps are incomplete based on completedSteps
  const incompleteRequiredSteps = useMemo(() => {
    return props.steps.filter(
      (step, index) => step.required && !props.completedSteps?.[index],
    );
  }, [props.steps, props.completedSteps]);

  const hasIncompleteSteps = incompleteRequiredSteps.length > 0;

  return (
    <>
      <Panel title={translate('Progress')} cardBordered className="mb-5">
        <FormSteps
          key={`steps-${props.steps.length}`}
          steps={props.steps}
          completedSteps={props.completedSteps}
          errors={{}}
          showRequiredErrors
        />
      </Panel>
      {props.editable && (
        <>
          <FloatingSubmitButton
            submitting={props.submitting}
            label={translate('Submit')}
            variant="primary"
            disabled={props.isSaving || hasIncompleteSteps}
            errors={
              hasIncompleteSteps
                ? [
                    translate(
                      'Complete all required sections to proceed: {sections}',
                      {
                        sections: incompleteRequiredSteps
                          .map((step) => step.label)
                          .join(', '),
                      },
                    ),
                  ]
                : undefined
            }
          />

          <ActionButton
            action={props.saveAsDraft}
            title={translate('Save as draft')}
            variant="secondary"
            className="w-100 mt-2"
            disabled={props.submitting}
            disabledReason={translate('Saving draft...')}
            pending={props.isSaving}
          />
          <TosNotification />
        </>
      )}
    </>
  );
};
