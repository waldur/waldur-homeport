import { useCallback, useEffect, FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Field, change } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { formatResourceShort } from '@waldur/marketplace/utils';

import { refetchs } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { ISSUE_REGISTRATION_FORM_ID } from './constants';
import { projectSelector } from './selectors';

const filterOption = (options) => options;

export const ResourceGroup: FunctionComponent<{ disabled }> = ({
  disabled,
}) => {
  const dispatch = useDispatch();
  const project = useSelector(projectSelector);
  const loadData = useCallback((name) => refetchs(name, project), [project]);

  useEffect(() => {
    dispatch(change(ISSUE_REGISTRATION_FORM_ID, 'resource', undefined));
  }, [dispatch, project]);

  return (
    <Form.Group>
      <Col sm={3} as={Form.Label}>
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
            getOptionValue={(option) => formatResourceShort(option)}
            getOptionLabel={(option) => formatResourceShort(option)}
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
    </Form.Group>
  );
};
