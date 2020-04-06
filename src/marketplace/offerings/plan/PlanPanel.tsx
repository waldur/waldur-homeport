import * as React from 'react';
import { useState } from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';

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

const PurePlanPanel = (props: OwnProps & StateProps) => {
  const [open, setOpen] = useState(!props.archived);

  const togglePanel = () => {
    setOpen(!open);
  };

  return (
    <Panel defaultExpanded={open} id="plan-panel">
      <Panel.Heading>
        <h4 onClick={togglePanel}>
          {translate('Plan #{index}', { index: props.index + 1 })}
          {props.archived ? ' (archived)' : ''}
        </h4>
        <RemoveButton onClick={() => props.onRemove(props.index)} />
      </Panel.Heading>

      <Panel.Collapse>
        <Panel.Body className={props.archived ? 'disabled' : undefined}>
          <PlanForm plan={props.plan} archived={props.archived} />
        </Panel.Body>
      </Panel.Collapse>
    </Panel>
  );
};

const connector = connect<StateProps, {}, OwnProps>((state, ownProps) => ({
  archived: getPlanData(state, ownProps.plan).archived,
}));

export const PlanPanel = connector(PurePlanPanel);
