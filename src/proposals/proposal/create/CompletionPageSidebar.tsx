import { Button, Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';
import { PlatformTosNotification } from '@waldur/marketplace/deploy/PlatformTosNotification';

import { SubmitButton } from './SubmitButton';

interface CompletionPageSidebarProps {
  canSubmit: boolean;
  submitProposal(): void;
  submitting: boolean;
}

export const CompletionPageSidebar = (props: CompletionPageSidebarProps) => {
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
              <SubmitButton
                title={translate('Update project details')}
                className="w-100"
                loading={props.submitting}
              />

              <div className="d-flex justify-content-between mt-5">
                <Button
                  size="sm"
                  onClick={props.submitProposal}
                  className="w-100"
                >
                  {translate('To team verification')}
                </Button>
              </div>
            </>
          )}

          <PlatformTosNotification />
        </Card.Body>
      </Card>
    </div>
  );
};
