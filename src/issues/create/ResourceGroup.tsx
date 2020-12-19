import { useCallback, useEffect, FunctionComponent } from 'react';
import { Col, ControlLabel, FormGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Field, change } from 'redux-form';

import { translate } from '@waldur/i18n';

import { refreshResources } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { ISSUE_REGISTRATION_FORM_ID } from './constants';
import { projectSelector } from './selectors';

const filterOption = (options) => options;

export const ResourceGroup: FunctionComponent<{ disabled }> = ({
  disabled,
}) => {
  const dispatch = useDispatch();
  const project = useSelector(projectSelector);
  const loadData = useCallback((name) => refreshResources(name, project), [
    project,
  ]);

  useEffect(() => {
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
            isClearable={true}
            defaultOptions
            loadOptions={loadData}
            getOptionValue={(option) => option.name}
            getOptionLabel={(option) => option.name}
            isDisabled={disabled}
            filterOption={filterOption}
          />
        ) : (
          <Select
            options={[]}
            isDisabled={true}
            placeholder={translate('Select affected resource...')}
          />
        )}
      </Col>
    </FormGroup>
  );
};
