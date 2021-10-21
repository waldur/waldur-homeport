import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { DateField } from '@waldur/form/DateField';
import { datePickerOverlayContainerInDialogs } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';

import './ProjectsListGroup.scss';
import { ProjectRoleField } from './ProjectRoleField';

export const ProjectsListGroup: FunctionComponent<{
  canChangeRole;
  projects;
}> = ({ canChangeRole, projects }) => {
  return projects.length === 0 ? (
    <p className="text-danger">
      {translate('There are no available projects.')}
    </p>
  ) : (
    <FormGroup id="projects-list-group">
      <ControlLabel>{translate('Projects list')}</ControlLabel>
      <div style={{ height: 300, overflow: 'visible', marginBottom: '33px' }}>
        <table className="table">
          <thead>
            <tr>
              <td>{translate('Project name')}</td>
              <td className="role-column">{translate('Role')}</td>
              <td className="expiration-time-column">
                {translate('Expiration time')}
              </td>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.uuid}>
                <td className="align-middle">{project.name}</td>
                <td className="role-column">
                  <ProjectRoleField
                    index={index}
                    canChangeRole={canChangeRole}
                  />
                </td>
                <td className="expiration-time-column">
                  <Field
                    name={`projects[${index}].expiration_time`}
                    component={DateField}
                    disabled={!canChangeRole}
                    minDate={DateTime.now().plus({ days: 1 }).toISO()}
                    weekStartsOn={1}
                    {...datePickerOverlayContainerInDialogs()}
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
