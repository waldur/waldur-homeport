import { Button, Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';

import { SubmitButton } from './SubmitButton';

interface CompletionPageSidebarProps {
  canSwitchToTeam: boolean;
  switchToTeam(): void;
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
          {props.canSwitchToTeam && (
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
                  'Please make sure that  project proposal details and resource requests are finalised. During team verification they will not be editable.',
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
