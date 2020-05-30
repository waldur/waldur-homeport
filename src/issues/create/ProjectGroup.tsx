import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Field, change } from 'redux-form';

import { translate } from '@waldur/i18n';

import { refreshProjects } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { ISSUE_REGISTRATION_FORM_ID } from './constants';
import { projectSelector, customerSelector } from './selectors';

const filterOptions = options => options;

export const ProjectGroup = ({ onSearch, disabled }) => {
  const dispatch = useDispatch();
  const project = useSelector(projectSelector);
  const customer = useSelector(customerSelector);

  const filterByProject = React.useCallback(() => onSearch({ project }), [
    project,
    onSearch,
  ]);

  const loadOptions = React.useCallback(
    name => refreshProjects(name, customer),
    [customer],
  );

  React.useEffect(() => {
    dispatch(change(ISSUE_REGISTRATION_FORM_ID, 'project', undefined));
  }, [dispatch, customer]);

  return (
    <FormGroup>
      <Col sm={3} componentClass={ControlLabel}>
        {translate('Project')}
      </Col>
      <Col sm={6}>
        {customer ? (
          <Field
            name="project"
            component={AsyncSelectField}
            placeholder={translate('Select project...')}
            clearable={true}
            loadOptions={loadOptions}
            minimalInput={0}
            valueKey="uuid"
            labelKey="name"
            disabled={disabled}
            filterOptions={filterOptions}
          />
        ) : (
          <Select
            options={[]}
            disabled={true}
            placeholder={translate('Select project...')}
          />
        )}
      </Col>
      {project && (
        <Col sm={3}>
          <Button onClick={filterByProject}>
            <i className="fa fa-search" /> {translate('Filter')}
          </Button>
        </Col>
      )}
    </FormGroup>
  );
};
