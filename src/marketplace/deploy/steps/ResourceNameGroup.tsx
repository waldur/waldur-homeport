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
      const name = response.data['name'];
      props.input.onChange(
        props.formatSuggestedName ? props.formatSuggestedName(name) : name,
      );
    },
    onError: (error) => {
      dispatch(showErrorResponse(error as any));
    },
  });

  return (
    <div className="d-flex justify-content-between">
      <div className="flex-grow-1 me-3 ">
        <StringField input={props.input} isInvalid={props.isInvalid} />
      </div>
      {project ? (
        <Button
          variant="tertiary"
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
          <Button variant="tertiary" disabled>
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
  ...props
}) => (
  <Field
    name="attributes.name"
    label={nameLabel}
    component={FormGroup}
    required={true}
    description={translate('This name will be visible in accounting data.')}
    validate={nameValidate}
  >
    <ResourceNameField
      offering={offering}
      project={project}
      formatSuggestedName={props.formatSuggestedName}
    />
  </Field>
);
