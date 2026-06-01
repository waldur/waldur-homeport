import { ProviderOfferingDetails } from 'waldur-js-client';

import { StringGroup } from '@/form';
import { translate } from '@/i18n';

import { ArticleCodeField } from '../../ArticleCodeField';
import { DisplayNameField } from '../../DisplayNameField';
import { InternalNameField } from '../../InternalNameField';

import { ComponentAccountingTypeField } from './ComponentAccountingTypeField';
import { ComponentLimit } from './ComponentLimit';
import { ComponentPrepaidFieldGroup } from './ComponentPrepaidFieldGroup';

const componentMeasuredUnitValidator = (value: string) => {
  if (!value) {
    return undefined;
  }
  if (value.length > 30) {
    return translate('Ensure this field has no more than 30 characters.');
  }
};

export const ComponentForm = ({
  readOnly,
  offering,
}: {
  readOnly?: boolean;
  offering: ProviderOfferingDetails;
}) => (
  <>
    <InternalNameField name="type" readOnly={readOnly} />
    <DisplayNameField name="name" readOnly={readOnly} />
    <StringGroup
      label={translate('Measured unit')}
      name="measured_unit"
      validate={componentMeasuredUnitValidator}
      disabled={readOnly}
      space={5}
    />
    <ComponentAccountingTypeField readOnly={readOnly} />
    <ArticleCodeField />
    <ComponentPrepaidFieldGroup offering={offering} />
    <ComponentLimit readOnly={readOnly} />
  </>
);
