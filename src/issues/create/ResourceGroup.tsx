import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Field, change } from 'redux-form';

import { translate } from '@waldur/i18n';

import { refreshResources } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { ISSUE_REGISTRATION_FORM_ID } from './constants';
import { projectSelector } from './selectors';

const filterOptions = options => options;

export const ResourceGroup = ({ disabled }) => {
  const dispatch = useDispatch();
  const project = useSelector(projectSelector);
  const loadData = React.useCallback(name => refreshResources(name, project), [
    project,
  ]);

  React.useEffect(() => {
    dispatch(change(ISSUE_REGISTRATION_FORM_ID, 'resource', undefined));
  }, [dispatch, project]);

  return (
    <FormGroup>
      <Col sm={3} componentClass={ControlLabel}>
        {translate('Affected resource')}
      </Col>
      <Col sm={6}>
        {project ? (
          <Field
            name="resource"
            component={AsyncSelectField}
            placeholder={translate('Select affected resource...')}
            clearable={true}
            loadOptions={loadData}
            valueKey="name"
            labelKey="name"
            disabled={disabled}
            filterOptions={filterOptions}
          />
        ) : (
          <Select
            options={[]}
            disabled={true}
            placeholder={translate('Select affected resource...')}
          />
        )}
      </Col>
    </FormGroup>
  );
};
