import { ClipboardTextIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ProjectCostField } from '../ProjectCostField';

export const ProjectDetailsDialog: FC<{
  project: Project;
}> = ({ project }) => {
  return (
    <ModalDialog
      title={translate('Project details for {name}', { name: project.name })}
      subtitle={translate('Project owned by {name}', {
        name: project.customer_name,
      })}
      closeButton
      iconNode={<ClipboardTextIcon weight="bold" />}
      iconColor="success"
    >
      <FormTable hideActions alignTop detailsMode className="gy-5">
        <FormTable.Item
          label={translate('Name')}
          value={<FieldWithCopy value={project.name} />}
        />

        <FormTable.Item
          label={translate('Owner')}
          value={<FieldWithCopy value={project.customer_name} />}
        />

        <FormTable.Item
          label={translate('Start date')}
          value={
            <FieldWithCopy
              value={project.start_date ? formatDate(project.start_date) : null}
            />
          }
        />

        <FormTable.Item
          label={translate('End date')}
          value={
            <FieldWithCopy
              value={project.end_date ? formatDate(project.end_date) : null}
            />
          }
        />

        <FormTable.Item
          label={translate('Description')}
          value={<FieldWithCopy value={project.description} />}
        />

        <FormTable.Item
          label={translate('Estimated cost')}
          value={<FieldWithCopy value={ProjectCostField({ row: project })} />}
        />
      </FormTable>
    </ModalDialog>
  );
};
