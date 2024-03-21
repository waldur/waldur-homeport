import { Button, Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';

import { SubmitButton } from './SubmitButton';

interface CompletionPageSidebarProps {
  canSubmit: boolean;
  submitProposal(): void;
  submitting: boolean;
}

export const ProposalSidebar = (props: CompletionPageSidebarProps) => {
  const isVerticalMode = useMediaQuery({ maxWidth: 1200 });

  return (
    <div
      className={
        isVerticalMode
          ? 'proposal-manage-sidebar container-xxl'
          : 'proposal-manage-sidebar drawer drawer-end drawer-on'
      }
    >
      <Card className="card-flush border-0">
        <Card.Body>
          {props.canSubmit && (
            <>
              <div className="d-flex justify-content-between mt-5">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={props.submitProposal}
                  className="w-100"
                >
                  {translate('To team verification')}
                </Button>
              </div>

              <p className="text-center fs-9 mt-2 mb-0">
                {translate(
                  'When you proceed to team verification, you would be unable to edit project details or resource requests and they are going to be available for editing only during review phase.',
                )}
              </p>

              <SubmitButton
                title={translate('Update project details')}
                className="w-100"
                loading={props.submitting}
              />
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
