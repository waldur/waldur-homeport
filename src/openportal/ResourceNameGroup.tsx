import { LightbulbFilamentIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field } from 'redux-form';
import { marketplaceResourcesSuggestName } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { getNameFieldValidators } from '@waldur/core/validators';
import { FormGroup, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';

const ResourceNameField = (props) => {
  const dispatch = useDispatch();
  const project = props.project;
  const { mutate: suggestName, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      const response = await marketplaceResourcesSuggestName({
        body: {
          project: project.uuid,
          offering: props.offering.uuid,
        },
      });
      props.input.onChange(response.data['name']);
    },
    onError: (error) => {
      dispatch(showErrorResponse(error as any));
    },
  });

  return (
    <div className="d-flex justify-content-between">
      <div className="flex-grow-1 me-3 ">
        <StringField input={props.input} placeholder={props.offering.name} />
      </div>
      {project ? (
        <Button
          variant="tertiary"
          className="btn-tertiary"
          onClick={() => suggestName()}
          disabled={isLoading}
        >
          <span className="svg-icon svg-icon-2">
            <LightbulbFilamentIcon weight="bold" />
          </span>
          {translate('Suggest name')}
        </Button>
      ) : (
        <Tip
          id="ResourceNameField"
          label={translate('Organization and project need to be selected.')}
        >
          <Button variant="tertiary" className="btn-tertiary" disabled>
            <span className="svg-icon svg-icon-2">
              <LightbulbFilamentIcon weight="bold" />
            </span>
            {translate('Suggest name')}
          </Button>
        </Tip>
      )}
    </div>
  );
};
export const ResourceNameGroup = ({
  nameValidate = getNameFieldValidators(),
  nameLabel = translate('Name'),
  offering,
  project,
}) => (
  <Field
    name="attributes.name"
    label={nameLabel}
    component={FormGroup}
    required={true}
    description={translate('This name will be visible in accounting data.')}
    validate={nameValidate}
    initialValue={offering.name}
  >
    <ResourceNameField offering={offering} project={project} />
  </Field>
);
