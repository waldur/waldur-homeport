import { useMemo } from 'react';

import { Panel } from '@waldur/core/Panel';
import { FloatingSubmitButton } from '@waldur/form/FloatingSubmitButton';
import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarProps } from '@waldur/form/SidebarProps';
import { TosNotification } from '@waldur/form/TosNotification';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

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
            pending={props.isSaving}
          />
          <TosNotification />
        </>
      )}
    </>
  );
};
