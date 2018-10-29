import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';
import { WrappedFieldArrayProps } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';
import { PlanAddButton } from './PlanAddButton';
import { PlanForm } from './PlanForm';

type PlansListProps = TranslateProps & WrappedFieldArrayProps<any>;

const PurePlansList = withTranslation((props: PlansListProps) => (
  <div className="form-group">
    <Col smOffset={2} sm={8} className="m-b-sm">
      <p className="form-control-static">
        <strong>{props.translate('Accounting plans')}</strong>
      </p>
    </Col>

    <Col smOffset={2} sm={8}>
      {props.fields.map((plan, index) => (
        <Panel key={index}>
          <Panel.Heading>
            <RemoveButton onClick={() => props.fields.remove(index)}/>
            <h4>{props.translate('Plan #{index}', {index: index + 1})}</h4>
          </Panel.Heading>
          <Panel.Body>
            <PlanForm plan={plan}/>
          </Panel.Body>
        </Panel>
      ))}
      <PlanAddButton onClick={() => props.fields.push({})}/>
    </Col>
  </div>
));

export class PlansList extends React.Component<PlansListProps> {
  componentDidMount() {
    if (this.props.fields.length === 0) {
      this.props.fields.push({});
    }
  }

  render() {
    return <PurePlansList {...this.props}/>;
  }
}
