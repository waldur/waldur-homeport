import { useMutation } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { post } from '@waldur/core/api';
import { Tip } from '@waldur/core/Tooltip';
import { getNameFieldValidators } from '@waldur/core/validators';
import { FormGroup, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { orderProjectSelector } from '@waldur/marketplace/details/utils';

const ResourceNameField = (props) => {
  const project = useSelector(orderProjectSelector);
  const { mutate: suggestName, isLoading } = useMutation(async () => {
    const response = await post('/marketplace-resources/suggest_name/', {
      project: project.uuid,
      offering: props.offering.uuid,
    });
    props.input.onChange(response.data['name']);
  });

  return (
    <div className="d-flex justify-content-between">
      <div className="flex-grow-1 me-3 ">
        <StringField input={props.input} />
      </div>
      {project ? (
        <Button
          variant="primary"
          onClick={() => suggestName()}
          disabled={isLoading}
        >
          {translate('Suggest name')}
        </Button>
      ) : (
        <Tip
          id="ResourceNameField"
          label={translate('Organization and project need to be selected.')}
        >
          <Button variant="primary" disabled>
            {translate('Suggest name')}
          </Button>
        </Tip>
      )}
    </div>
  );
};
export const ResourceNameGroup = ({ nameValidate, nameLabel, offering }) => (
  <Field
    name="attributes.name"
    label={nameLabel || translate('Name')}
    component={FormGroup}
    required={true}
    description={translate('This name will be visible in accounting data.')}
    validate={nameValidate || getNameFieldValidators()}
  >
    <ResourceNameField offering={offering} />
  </Field>
);
