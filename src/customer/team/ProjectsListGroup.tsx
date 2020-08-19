import moment from 'moment-timezone';
import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { ENV } from '@waldur/core/services';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/issues/create/SelectField';

export const ProjectsListGroup = ({ canChangeRole, projects }) => {
  return projects.length === 0 ? (
    <p className="text-danger">
      {translate('There are no available projects.')}
    </p>
  ) : (
    <FormGroup>
      <ControlLabel>{translate('Projects list')}</ControlLabel>
      <div style={{ height: 300, overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <td>{translate('Project name')}</td>
              <td>{translate('Role')}</td>
              <td className="col-xs-4">{translate('Expiration time')}</td>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.uuid}>
                <td className="align-middle">{project.name}</td>
                <td>
                  <Field
                    name={`projects[${index}].role`}
                    component={SelectField}
                    isDisabled={!canChangeRole}
                    simpleValue={true}
                    options={[
                      { value: 'admin', label: translate(ENV.roles.admin) },
                      { value: 'manager', label: translate(ENV.roles.manager) },
                    ]}
                    isClearable={true}
                  />
                </td>
                <td>
                  <Field
                    name={`projects[${index}].expiration_time`}
                    component={DateField}
                    disabled={!canChangeRole}
                    minDate={moment().add(1, 'days').toISOString()}
                    weekStartsOn={1}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FormGroup>
  );
};
