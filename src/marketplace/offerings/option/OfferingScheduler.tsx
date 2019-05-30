import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Panel from 'react-bootstrap/lib/Panel';

import { WrappedFieldArrayProps } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

type Props = TranslateProps & WrappedFieldArrayProps<any>;

export const OfferingScheduler = withTranslation((props: Props) => (
  <div className="form-group">
    <Col smOffset={2} sm={8}>
      <Panel>
        <Panel.Heading>
          <h4>{props.translate('Scheduler')}</h4>
         </Panel.Heading>
        <Panel.Body>
          <span>todo</span>
        </Panel.Body>
      </Panel>
    </Col>
  </div>
));
