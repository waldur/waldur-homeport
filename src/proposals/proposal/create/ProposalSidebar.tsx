import { Button } from 'react-bootstrap';

import {
  InjectedVStepperFormSidebarProps,
  VStepperFormSidebar,
  SubmitButton,
} from '@waldur/form/VStepperFormSidebar';
import { translate } from '@waldur/i18n';

interface CompletionPageSidebarProps extends InjectedVStepperFormSidebarProps {
  canSwitchToTeam: boolean;
  switchToTeam(): void;
}

export const ProposalSidebar = (props: CompletionPageSidebarProps) => {
  return (
    <VStepperFormSidebar
      {...props}
      customSummary={
        props.canSwitchToTeam && (
          <>
            <div className="d-flex justify-content-between mt-5">
              <Button
                size="sm"
                variant="danger"
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

            <SubmitButton
              title={translate('Save draft')}
              loading={props.submitting}
            />
          </>
        )
      }
      steps={null}
      hasTos={false}
      hasSubmitButton={false}
    />
  );
};
