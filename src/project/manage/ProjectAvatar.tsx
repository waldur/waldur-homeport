import { UploadSimpleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { projectsPartialUpdate } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { WideImageField } from '@/form/WideImageField';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';
import { setCurrentProject } from '@/workspace/actions';

interface FormData {
  image;
}

export const ProjectAvatar = ({ project }: { project: Project }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);
  const dispatch = useDispatch();

  const avatarMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (data) =>
      projectsPartialUpdate({
        path: { uuid: project.uuid },
        body: { image: fileSerializer(data.image) },
        ...formDataOptions,
      }),
    successMessage: translate('Project has been updated.'),
    errorMessage: translate('Project could not be updated.'),
    onSuccess: (response: any) => {
      dispatch(setCurrentProject({ ...project, image: response.data.image }));
    },
  });
  return (
    <Form
      onSubmit={(values: FormData) => avatarMutation.mutateAsync(values)}
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
