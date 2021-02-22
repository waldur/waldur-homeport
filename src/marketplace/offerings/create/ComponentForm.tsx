import { FunctionComponent } from 'react';

import { ArticleCodeField } from '../ArticleCodeField';
import { DisplayNameField } from '../DisplayNameField';
import { InternalNameField } from '../InternalNameField';
import { ProductCodeField } from '../ProductCodeField';

import { ComponentAccountingTypeField } from './ComponentAccountingTypeField';
import { ComponentLimit } from './ComponentLimit';
import { ComponentMeasuredUnitField } from './ComponentMeasuredUnitField';

interface ComponentFormProps {
  removeOfferingQuotas(): void;
}

export const ComponentForm: FunctionComponent<ComponentFormProps> = (props) => (
  <>
    <InternalNameField name="type" />
    <DisplayNameField name="name" />
    <ComponentMeasuredUnitField />
    <ComponentAccountingTypeField
      removeOfferingQuotas={props.removeOfferingQuotas}
    />
    <ArticleCodeField />
    <ProductCodeField />
    <ComponentLimit />
  </>
);
