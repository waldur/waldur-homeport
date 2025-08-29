import { ProjectCreateButton } from './create/ProjectCreateButton';
import { ProjectImportButton } from './import/ProjectImportButton';

export const ProjectsTableActions = ({ customer, refetch = undefined }) => (
  <>
    <ProjectImportButton customer={customer} refetch={refetch} />
    <ProjectCreateButton customer={customer} refetch={refetch} />
  </>
);
