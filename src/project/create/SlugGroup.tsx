import { Field } from 'react-final-form';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useUser } from '@waldur/workspace/hooks';
import { Customer } from '@waldur/workspace/types';

export const SlugGroup = ({ customer }: { customer?: Customer }) => {
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }
  const template = customer?.project_slug_template;
  const helpText = template
    ? translate(
        'If left empty, a slug in the format of "{template}" will be generated automatically.',
        { template },
      )
    : translate(
        'If left empty, the slug will be generated from the project name.',
      );
  return (
    <FormGroup label={translate('Project slug')} description={helpText}>
      <Field
        component={StringField as any}
        name="slug"
        placeholder={template || translate('Auto-generated')}
      />
    </FormGroup>
  );
};
