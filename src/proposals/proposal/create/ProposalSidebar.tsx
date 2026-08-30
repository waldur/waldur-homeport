import { useMemo } from 'react';

import { Panel } from '@/core/Panel';
import { FloatingSubmitButton } from '@/form/FloatingSubmitButton';
import { SidebarProps } from '@/form/SidebarProps';
import { TosNotification } from '@/form/TosNotification';
import { translate } from '@/i18n';
import { ProposalCostTotal } from '@/proposals/ProposalCostTotal';
import { ActionButton } from '@/table/ActionButton';
import { FormSteps } from '@/wizard';

interface CompletionPageSidebarProps extends SidebarProps {
  saveAsDraft(): void;
  isSaving?: boolean;
  editable?: boolean;
  /** Every requested resource, for the summary. */
  resourceRows?: any[];
  /** The call's fixed duration, for the summary's project length. */
  fixedDurationDays?: number | null;
  /**
   * What the backend says about submitting, and why not when it refuses.
   * The steps below only know whether a section was filled in; this covers
   * the rules the submit action itself enforces — a missing requested amount,
   * a missing purchase order — which otherwise surface as a rejected request
   * after the applicant has already pressed the button.
   */
  canSubmit?: { can_submit: boolean; error: string | null };
}

export const ProposalSidebar = (props: CompletionPageSidebarProps) => {
  // Check which required steps are incomplete based on completedSteps
  const incompleteRequiredSteps = useMemo(() => {
    return props.steps.filter(
      (step, index) => step.required && !props.completedSteps?.[index],
    );
  }, [props.steps, props.completedSteps]);

  const hasIncompleteSteps = incompleteRequiredSteps.length > 0;
  const serverRefusal =
    props.canSubmit && props.canSubmit.can_submit === false
      ? props.canSubmit.error
      : null;

  const submitErrors = useMemo(() => {
    const reasons: string[] = [];
    if (hasIncompleteSteps) {
      reasons.push(
        translate('Complete all required sections to proceed: {sections}', {
          sections: incompleteRequiredSteps
            .map((step) => step.label)
            .join(', '),
        }),
      );
    }
    if (serverRefusal) {
      reasons.push(serverRefusal);
    }
    return reasons.length ? reasons : undefined;
  }, [hasIncompleteSteps, incompleteRequiredSteps, serverRefusal]);

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
      {/* In view wherever the applicant has scrolled to. Renders nothing when
          there is nothing to total. */}
      <ProposalCostTotal
        rows={props.resourceRows || []}
        fixedDurationDays={props.fixedDurationDays}
        panel
      />
      {props.editable && (
        <>
          <FloatingSubmitButton
            submitting={props.submitting}
            label={translate('Submit')}
            variant="primary"
            disabled={
              props.isSaving || hasIncompleteSteps || Boolean(serverRefusal)
            }
            errors={submitErrors}
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
