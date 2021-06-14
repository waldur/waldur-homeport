import { ButtonGroup } from 'react-bootstrap';

import { FlowCancelAction } from './FlowCancelAction';
import { FlowEditAction } from './FlowEditAction';
import { FlowSubmitAction } from './FlowSubmitAction';

export const FlowActions = ({ flow, refreshList }) => {
  return flow.state === 'draft' ? (
    <ButtonGroup>
      <FlowSubmitAction flow={flow} refreshList={refreshList} />
      <FlowCancelAction flow={flow} refreshList={refreshList} />
      <FlowEditAction flow={flow} />
    </ButtonGroup>
  ) : (
    <>N/A</>
  );
};
