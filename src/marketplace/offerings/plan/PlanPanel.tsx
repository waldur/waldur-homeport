import { Accordion } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { RemoveButton } from '../RemoveButton';
import { getPlanData } from '../store/selectors';

import { PlanForm } from './PlanForm';

import './PlanPanel.scss';

interface OwnProps {
  index: number;
  plan: string;
  onRemove(index: number): void;
}

interface StateProps {
  archived: boolean;
}

const PurePlanPanel = (props: OwnProps & StateProps) => (
  <Accordion defaultActiveKey="summary" id="plan-panel">
    <Accordion.Item eventKey="summary">
      <Accordion.Header>
        <h4>
          {translate('Plan #{index}', { index: props.index + 1 })}
          {props.archived ? ' (archived)' : ''}
        </h4>
        <RemoveButton onClick={() => props.onRemove(props.index)} />
      </Accordion.Header>

      <Accordion.Body className={props.archived ? 'disabled' : undefined}>
        <PlanForm plan={props.plan} archived={props.archived} />
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
);

const connector = connect<StateProps, {}, OwnProps, RootState>(
  (state, ownProps) => ({
    archived: getPlanData(state, ownProps.plan).archived,
  }),
);

export const PlanPanel = connector(PurePlanPanel);
