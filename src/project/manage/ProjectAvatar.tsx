import { UploadSimple } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { Button, Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { Project } from '@waldur/workspace/types';

import { updateProject } from '../actions';
import { EDIT_PROJECT_IMAGE_ID } from '../constants';

interface ProjectAvatarProps {
  project: Project;
}

interface FormData {
  image;
}

export const ProjectAvatar = connect<{}, {}, ProjectAvatarProps>(
  (_, ownProps) => ({
    initialValues: { image: ownProps.project.image },
  }),
)(
  reduxForm<FormData, ProjectAvatarProps>({
    form: EDIT_PROJECT_IMAGE_ID,
    enableReinitialize: true,
  })((props) => {
    const abbreviation = useMemo(
      () => getItemAbbreviation(props.project),
      [props.project],
    );

    const processRequest = useCallback(
      (values: FormData, dispatch) => {
        return updateProject(
          { data: values, uuid: props.project.uuid, cache: props.project },
          dispatch,
        );
      },
      [props.project],
    );

    return (
      <Card
        as="form"
        onSubmit={props.handleSubmit(processRequest)}
        className="card-bordered"
      >
        <Card.Body className="d-flex flex-column flex-sm-row gap-8">
          <Field
            name="image"
            component={(fieldProps) => (
              <WideImageField
                alt={abbreviation}
                initialValue={props.project.image}
                max={2 * 1024 * 1024} // 2MB
                size={65}
                extraActions={({ isChanged, isTooLarge }) =>
                  isChanged || props.submitting ? (
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="btn-icon-right"
                      disabled={props.submitting || isTooLarge}
                    >
                      {translate('Save')}
                      <span className="svg-icon svg-icon-5">
                        <UploadSimple weight="bold" />
                      </span>
                    </Button>
                  ) : null
                }
                {...fieldProps}
              />
            )}
          />
        </Card.Body>
      </Card>
    );
  }),
);
