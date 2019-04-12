import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import { WrappedFieldArrayProps } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { getBillingPeriods } from './constants';
import { PlanAddButton } from './PlanAddButton';
import { PlanPanel } from './PlanPanel';

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
        <PlanPanel key={index} plan={plan} index={index} onRemove={props.fields.remove}/>
      ))}
      <PlanAddButton onClick={() => props.fields.push({})}/>
    </Col>
  </div>
));

export class PlansList extends React.Component<PlansListProps> {
  componentDidMount() {
    if (this.props.fields.length === 0) {
      this.props.fields.push({
        billing_period: getBillingPeriods()[0],
      });
    }
  }

  render() {
    return <PurePlansList {...this.props}/>;
  }
}
