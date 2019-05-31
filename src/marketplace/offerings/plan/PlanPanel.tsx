import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';
import { getPlanData } from '../store/selectors';
import { PlanForm } from './PlanForm';

interface OwnProps {
  index: number;
  plan: string;
  onRemove(index: number): void;
}

interface StateProps {
  archived: boolean;
}

const PurePlanPanel = (props: OwnProps & StateProps) => (
  <Panel className={props.archived ? 'disabled' : undefined}>
    <Panel.Heading>
      <RemoveButton onClick={() => props.onRemove(props.index)}/>
      <h4>{translate('Plan #{index}', {index: props.index + 1})}</h4>
    </Panel.Heading>
    <Panel.Body>
      <PlanForm plan={props.plan} archived={props.archived}/>
    </Panel.Body>
  </Panel>
);

const connector = connect<StateProps, {}, OwnProps>((state, ownProps) => ({
  archived: getPlanData(state, ownProps.plan).archived,
}));

export const PlanPanel = connector(PurePlanPanel);
