import { ButtonGroup } from 'react-bootstrap';

import { FlowCancelAction } from './FlowCancelAction';
import { FlowEditAction } from './FlowEditAction';
import { FlowSubmitAction } from './FlowSubmitAction';

export const FlowActions = ({ flow, refetch }) => {
  return flow.state === 'draft' ? (
    <ButtonGroup>
      <FlowSubmitAction flow={flow} refetch={refetch} />
      <FlowCancelAction flow={flow} refetch={refetch} />
      <FlowEditAction flow={flow} />
    </ButtonGroup>
  ) : (
    <>N/A</>
  );
};
