import { FC } from 'react';
import { ManagedProject } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n/translate';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: ManagedProject;
}

const ProjectLink: FC<{ row: any }> = ({ row }) => {
  if (row.project_data) {
    const project = row.project_data;
    return (
      <Link
        state="project.dashboard"
        params={{ uuid: project.uuid }}
        label={project.name || translate('Unnamed Project')}
      />
    );
  }

  if (row.project) {
    return <>{row.project}</>;
  }

  return <>{translate('No project assigned')}</>;
};

const ProjectTemplateLink: FC<{ row: any }> = ({ row }) => {
  if (row.project_template_data) {
    const template = row.project_template_data;
    return <>{template.name}</>;
  }

  if (row.project_template) {
    return <>{row.project_template}</>;
  }

  if (row.details?.template) {
    return <>{row.details.template}</>;
  }

  if (row.details?.class) {
    return <>{row.details.class}</>;
  }

  return <>{translate('No project template assigned')}</>;
};

const Offering: FC<{ destination?: string | null }> = ({ destination }) => {
  if (destination) {
    const parts = destination.split('.');
    return <>{parts[parts.length - 1]}</>;
  }
  return <>-</>;
};

const RoleString: FC<{ role: any; projectTemplate: any }> = ({
  role,
  projectTemplate,
}) => {
  if (!role) {
    return <>{translate('No role assigned')}</>;
  }
  if (!projectTemplate || !projectTemplate.role_mapping) {
    return <>{translate('Will not be added to project')}</>;
  }

  let mapped_role = projectTemplate.role_mapping[role];

  if (!mapped_role) {
    mapped_role = Object.entries(projectTemplate.role_mapping).find(
      ([key]) => key.toLowerCase() === role.toLowerCase(),
    )?.[1];

    if (!mapped_role) {
      return (
        <>
          {translate('{role} has no mapping - will not be added to project', {
            role,
          })}
        </>
      );
    }
  }

  return (
    <>
      {mapped_role.description ||
        mapped_role.name ||
        mapped_role.uuid ||
        translate('Not set')}
    </>
  );
};

const MembersList = ({ members, projectTemplate }) => {
  if (!members || Object.keys(members).length === 0) {
    return <>{translate('No members assigned')}</>;
  }

  return (
    <>
      {Object.entries(members).map(([key, value]) => (
        <div key={key}>
          &nbsp;&nbsp;{key} :{' '}
          <RoleString role={value} projectTemplate={projectTemplate} />
        </div>
      ))}
    </>
  );
};

export const ManagedProjectExpandableRow: FC<OwnProps> = (props) => {
  return (
    <ExpandableContainer>
      <div className="overflow-auto">
        <div>
          <strong>{translate('Project name')}:</strong>{' '}
          {props.row.details['name'] || translate('No name assigned.')}
        </div>
        <div>
          <strong>{translate('Project')}:</strong>{' '}
          <ProjectLink row={props.row} />
        </div>
        <div>
          <strong>{translate('Offering')}:</strong>{' '}
          <Offering destination={props.row.destination} />
        </div>
        <div>
          <strong>{translate('Project template')}:</strong>{' '}
          <ProjectTemplateLink row={props.row} />
        </div>
        <div>
          <strong>{translate('Description')}:</strong>{' '}
          {props.row.details['description'] ||
            translate('No description provided.')}
        </div>
        <div>
          <strong>{translate('Members')}:</strong>{' '}
          <MembersList
            members={props.row.details['members']}
            projectTemplate={props.row.project_template_data}
          />
        </div>
        <div>
          <strong>{translate('Allocation')}:</strong>{' '}
          {props.row.details['allocation'] ||
            translate('No allocation provided.')}
        </div>
        <div>
          <strong>{translate('Start date')}:</strong>{' '}
          {props.row.details['start_date']
            ? formatDate(props.row.details['start_date'])
            : translate('No start date provided.')}
        </div>
        <div>
          <strong>{translate('End date')}:</strong>{' '}
          {props.row.details['end_date']
            ? formatDate(props.row.details['end_date'])
            : translate('No end date provided.')}
        </div>
        <div>
          <strong>{translate('Created')}:</strong>{' '}
          {props.row.created
            ? formatDateTime(props.row.created)
            : translate('No creation date provided.')}
        </div>
        <div>
          <strong>{translate('Remote identifier')}:</strong>{' '}
          {props.row.identifier || translate('No remote identifier provided.')}
        </div>
        <div>
          <strong>{translate('Local identifier')}:</strong>{' '}
          {props.row.local_identifier ||
            translate('No local identifier provided.')}
        </div>
        <div>
          <strong>{translate('State')}:</strong>{' '}
          {props.row.state || translate('No state provided.')}
        </div>
        <div>
          <strong>{translate('Reviewed by')}:</strong>{' '}
          {props.row.reviewed_by_full_name || translate('No reviewer yet.')}
        </div>
        <div>
          <strong>{translate('Comment')}:</strong>{' '}
          {props.row.review_comment || translate('No comment provided.')}
        </div>
      </div>
    </ExpandableContainer>
  );
};
