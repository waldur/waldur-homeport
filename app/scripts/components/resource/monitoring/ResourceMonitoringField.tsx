import * as React from 'react';

import { connect } from 'react-redux';

import { Field } from '@waldur/resource/summary';
import { isVisible } from '@waldur/store/config';

import { ResourceMonitoringIndicator } from './ResourceMonitoringIndicator';

const PureResourceMonitoringField = props =>
  props.isVisible ? (
    <Field
      label={props.translate('Monitoring')}
      value={<ResourceMonitoringIndicator resource={props.resource}/>}
    />
  ) : null;

const mapStateToProps = state => ({
  isVisible: isVisible(state, 'monitoring'),
});

export const ResourceMonitoringField = connect(mapStateToProps)(PureResourceMonitoringField);
