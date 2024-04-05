import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormSyncErrors } from 'redux-form';

import { FloatingSubmitButton } from '@waldur/form/FloatingSubmitButton';
import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarProps } from '@waldur/form/SidebarProps';
import { translate } from '@waldur/i18n';
import { PROPOSAL_UPDATE_SUBMISSION_FORM_ID } from '@waldur/proposals/constants';

interface CompletionPageSidebarProps extends SidebarProps {
  canSwitchToTeam: boolean;
  switchToTeam(): void;
}

const formErrorsSelector = (state) =>
  getFormSyncErrors(PROPOSAL_UPDATE_SUBMISSION_FORM_ID)(state) as any;

export const ProposalSidebar = (props: CompletionPageSidebarProps) => {
  const errors = useSelector(formErrorsSelector);

  return (
    <>
      <FormSteps
        steps={props.steps}
        completedSteps={props.completedSteps}
        errors={errors}
      />
      {props.canSwitchToTeam && (
        <>
          <div className="d-flex justify-content-between mt-5">
            <Button
              size="sm"
              variant="primary"
              onClick={props.switchToTeam}
              className="w-100"
            >
              {translate('To team verification')}
            </Button>
          </div>

          <p className="text-center fs-9 mt-2 mb-0">
            {translate(
              'Please make sure that project proposal details and resource requests are finalised. During team verification they will not be editable.',
            )}
          </p>

          <FloatingSubmitButton
            submitting={props.submitting}
            label={translate('Save draft')}
            variant="secondary"
            errors={errors}
          />
        </>
      )}
    </>
  );
};
