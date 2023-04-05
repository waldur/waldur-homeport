import { useCurrentStateAndParams } from '@uirouter/react';
import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { ProjectCreateButton } from '@waldur/project/ProjectCreateButton';
import { getCustomer } from '@waldur/workspace/selectors';

import { FormGroup } from '../offerings/FormGroup';

import { CustomerCreateGroup } from './CustomerCreateGroup';
import { ProjectCreateGroup } from './ProjectCreateGroup';
import { ProjectSelectField } from './ProjectSelectField';

export const ProjectField: FC<{ previewMode?: boolean }> = ({
  previewMode,
}) => {
  const customer = useSelector(getCustomer);
  const { state } = useCurrentStateAndParams();
  if (isDescendantOf('project', state)) {
    return null;
  }
  return customer?.projects ? (
    <FormGroup label={translate('Project')} required={true}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {customer.projects.length > 0 && (
          <div style={{ flexGrow: 1, marginRight: 10 }}>
            <ProjectSelectField projects={customer.projects} />
          </div>
        )}
        {!previewMode && <ProjectCreateButton />}
      </div>
      <Form.Text className="mb-0 text-muted">
        {translate('The project will be changed for all items in cart.')}
      </Form.Text>
    </FormGroup>
  ) : (
    <>
      <CustomerCreateGroup />
      <ProjectCreateGroup />
    </>
  );
};
