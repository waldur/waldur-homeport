import { Badge } from 'react-bootstrap';

import { FloatingSubmitButton } from '@waldur/form/FloatingSubmitButton';
import { SidebarProps, FormSidebar } from '@waldur/form/FormSidebar';
import { FormSteps } from '@waldur/form/FormSteps';
import { TosNotification } from '@waldur/form/TosNotification';
import { translate } from '@waldur/i18n';
import { Proposal } from '@waldur/proposals/types';

interface CreatePageSidebarProps extends SidebarProps {
  proposal: Proposal;
}

export const CreatePageSidebar = (props: CreatePageSidebarProps) => (
  <FormSidebar>
    <p className="text-muted fst-italic fs-7 mb-2">
      UUID: {props.proposal?.uuid}
    </p>
    <Badge bg="light" text="dark" className="mb-7">
      {translate('In review')}
    </Badge>
    <h6 className="fs-7">{translate('Review progress')}</h6>
    <FormSteps
      steps={props.steps}
      completedSteps={props.completedSteps}
      errors={[]}
    />
    <FloatingSubmitButton
      submitting={props.submitting}
      label={translate('Submit application')}
    />
    <TosNotification />
  </FormSidebar>
);
