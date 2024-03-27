import { Badge } from 'react-bootstrap';

import {
  InjectedVStepperFormSidebarProps,
  VStepperFormSidebar,
} from '@waldur/form/VStepperFormSidebar';
import { translate } from '@waldur/i18n';
import { Proposal } from '@waldur/proposals/types';

interface CreatePageSidebarProps extends InjectedVStepperFormSidebarProps {
  proposal: Proposal;
}

export const CreatePageSidebar = (props: CreatePageSidebarProps) => {
  return (
    <VStepperFormSidebar
      {...props}
      title={translate('Review progress')}
      submitLabel={translate('Submit application')}
      header={
        <>
          <p className="text-muted fst-italic fs-7 mb-2">
            UUID: {props.proposal?.uuid}
          </p>
          <Badge bg="light" text="dark" className="mb-7">
            {translate('In review')}
          </Badge>
        </>
      }
    />
  );
};
