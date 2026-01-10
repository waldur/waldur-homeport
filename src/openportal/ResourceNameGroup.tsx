import { LightbulbFilamentIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Field } from 'redux-form';
import { marketplaceResourcesSuggestName } from 'waldur-js-client';

import { getNameFieldValidators } from '@waldur/core/validators';
import { FormGroup, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

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
      <ActionButton
        variant="tertiary"
        action={() => suggestName()}
        pending={isLoading}
        disabled={!project}
        iconNode={<LightbulbFilamentIcon weight="bold" />}
        title={translate('Suggest name')}
        tooltip={
          !project
            ? translate('Organization and project need to be selected.')
            : undefined
        }
      />
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
