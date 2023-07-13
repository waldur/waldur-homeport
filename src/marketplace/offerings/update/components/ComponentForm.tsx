import { ArticleCodeField } from '../../ArticleCodeField';
import { DisplayNameField } from '../../DisplayNameField';
import { InternalNameField } from '../../InternalNameField';

import { ComponentAccountingTypeField } from './ComponentAccountingTypeField';
import { ComponentLimit } from './ComponentLimit';
import { ComponentMeasuredUnitField } from './ComponentMeasuredUnitField';

export const ComponentForm = () => (
  <>
    <InternalNameField name="type" />
    <DisplayNameField name="name" />
    <ComponentMeasuredUnitField />
    <ComponentAccountingTypeField />
    <ArticleCodeField />
    <ComponentLimit />
  </>
);
