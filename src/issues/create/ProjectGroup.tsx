import { useCallback, useEffect, FunctionComponent } from 'react';
import { Button, Col, ControlLabel, FormGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Field, change } from 'redux-form';

import { translate } from '@waldur/i18n';

import { refreshProjects } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { ISSUE_REGISTRATION_FORM_ID } from './constants';
import { projectSelector, customerSelector } from './selectors';

const filterOption = (options) => options;

export const ProjectGroup: FunctionComponent<{ onSearch; disabled }> = ({
  onSearch,
  disabled,
}) => {
  const dispatch = useDispatch();
  const project = useSelector(projectSelector);
  const customer = useSelector(customerSelector);

  const filterByProject = useCallback(() => onSearch({ project }), [
    project,
    onSearch,
  ]);

  const loadOptions = useCallback((name) => refreshProjects(name, customer), [
    customer,
  ]);

  useEffect(() => {
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
            isClearable={true}
            defaultOptions
            loadOptions={loadOptions}
            minimalInput={0}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            isDisabled={disabled}
            filterOption={filterOption}
            noOptionsMessage={() => translate('No projects')}
          />
        ) : (
          <Select
            options={[]}
            isDisabled={true}
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
