import { FC, useState } from 'react';
import { Col, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { Panel } from '@waldur/core/Panel';
import { ActionList } from '@waldur/dashboard/ActionList';
import { translate } from '@waldur/i18n';

import { Action } from './types';

export interface Category {
  title: string;
  metrics: string[];
  actions: Action[];
  charts: object[];
}

interface CategoryResourcesProps {
  category: Category;
}

export const CategoryResources: FC<CategoryResourcesProps> = ({ category }) => {
  const [choice, setChoice] = useState(0);

  return (
    <Panel title={category.title} className="mt-3">
      <ToggleButtonGroup
        value={choice}
        onChange={(value) => setChoice(value)}
        type="radio"
        name="metrics"
        defaultValue={0}
      >
        {category.metrics.map((metric, index) => (
          <ToggleButton key={index} id={index.toString()} value={index}>
            {metric}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Row>
        <Col md={8}>
          {category.charts.length === 0 ? (
            <p>{translate('There are no charts yet.')}</p>
          ) : (
            <EChart options={category.charts[choice]} height="200px" />
          )}
        </Col>
        <Col md={4}>
          <ActionList actions={category.actions} />
        </Col>
      </Row>
    </Panel>
  );
};
