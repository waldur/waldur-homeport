import { FunctionComponent } from 'react';

import { OfferingComponent } from '@waldur/marketplace/types';

import { ArticleCodeField } from '../ArticleCodeField';
import { DisplayNameField } from '../DisplayNameField';
import { InternalNameField } from '../InternalNameField';

import { ComponentAccountingTypeField } from './ComponentAccountingTypeField';
import { ComponentLimit } from './ComponentLimit';
import { ComponentMeasuredUnitField } from './ComponentMeasuredUnitField';

interface ComponentFormProps {
  removeOfferingQuotas(): void;
  builtinComponents: OfferingComponent[];
}

export const ComponentForm: FunctionComponent<ComponentFormProps> = (props) => (
  <>
    <InternalNameField
      name="type"
      disabled={!!props.builtinComponents.length}
    />
    <DisplayNameField name="name" disabled={!!props.builtinComponents.length} />
    <ComponentMeasuredUnitField disabled={!!props.builtinComponents.length} />
    <ComponentAccountingTypeField
      removeOfferingQuotas={props.removeOfferingQuotas}
      disabled={!!props.builtinComponents.length}
    />
    <ArticleCodeField />
    <ComponentLimit />
  </>
);
