import * as React from 'react';

import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import * as ToggleButton from 'react-bootstrap/lib/ToggleButton';
import * as ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';

import { EChart } from '@waldur/core/EChart';
import Panel from '@waldur/core/Panel';
import { Action, ActionList } from '@waldur/dashboard/ActionList';

export interface Category {
  title: string;
  metrics: string[];
  actions: Action[];
  charts: object[];
}

interface CategoryResourcesProps {
  category: Category;
}

export class CategoryResources extends React.Component<CategoryResourcesProps> {
  state = {
    choice: 0,
  };

  render() {
    return (
      <Panel title={this.props.category.title} className="m-t-md">
        <ToggleButtonGroup
          value={this.state.choice}
          onChange={value => this.setState({ choice: value })}
          type="radio"
          name="metrics"
          defaultValue={0}>
          {this.props.category.metrics.map((metric, index) => (
            <ToggleButton key={index} value={index}>
              {metric}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Row>
          <Col md={8}>
            <EChart
              options={this.props.category.charts[this.state.choice]}
              height="200px"
            />
          </Col>
          <Col md={4}>
            <ActionList actions={this.props.category.actions}/>
          </Col>
        </Row>
      </Panel>
    );
  }
}
