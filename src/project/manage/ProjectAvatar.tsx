import { UploadSimpleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { projectsPartialUpdate } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@waldur/core/api';
import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { useNotify } from '@waldur/store/hooks';
import { setCurrentProject } from '@waldur/workspace/actions';

interface FormData {
  image;
}

export const ProjectAvatar = ({ project }: { project: Project }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);
  const dispatch = useDispatch();
  const { showErrorResponse, showSuccess } = useNotify();

  const processRequest = async (data: FormData) => {
    try {
      const newProject = (
        await projectsPartialUpdate({
          path: { uuid: project.uuid },
          body: { image: fileSerializer(data.image) },
          ...formDataOptions,
        })
      ).data;
      dispatch(setCurrentProject({ ...project, image: newProject.image }));
      showSuccess(translate('Project has been updated.'));
      dispatch(closeModalDialog());
    } catch (e) {
      showErrorResponse(e, translate('Project could not be updated.'));
    }
  };
  return (
    <Form
      onSubmit={processRequest}
      initialValues={{ image: project.image }}
      render={({ handleSubmit, submitting }) => (
        <Card as="form" onSubmit={handleSubmit} className="card-bordered mb-5">
          <Card.Header>
            <Card.Title>
              <h3>{translate('Avatar')}</h3>
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Field
              name="image"
              component={(fieldProps) => (
                <WideImageField
                  alt={abbreviation}
                  initialValue={project.image}
                  max={2 * 1024 * 1024} // 2MB
                  size={64}
                  disabled={project.is_removed}
                  extraActions={({ isChanged, isTooLarge }) =>
                    (isChanged || submitting) && !project.is_removed ? (
                      <CompactSubmitButton
                        submitting={submitting}
                        disabled={isTooLarge}
                        label={translate('Save')}
                        iconNode={<UploadSimpleIcon weight="bold" />}
                      />
                    ) : null
                  }
                  {...(fieldProps as any)}
                />
              )}
            />
          </Card.Body>
        </Card>
      )}
    />
  );
};
