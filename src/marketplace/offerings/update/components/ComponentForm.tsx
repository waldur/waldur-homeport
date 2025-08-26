import { ArticleCodeField } from '../../ArticleCodeField';
import { DisplayNameField } from '../../DisplayNameField';
import { InternalNameField } from '../../InternalNameField';

import { ComponentAccountingTypeField } from './ComponentAccountingTypeField';
import { ComponentLimit } from './ComponentLimit';
import { ComponentMeasuredUnitField } from './ComponentMeasuredUnitField';

export const ComponentForm = ({ readOnly }: { readOnly?: boolean }) => (
  <>
    <InternalNameField name="type" readOnly={readOnly} />
    <DisplayNameField name="name" readOnly={readOnly} />
    <ComponentMeasuredUnitField readOnly={readOnly} />
    <ComponentAccountingTypeField readOnly={readOnly} />
    <ArticleCodeField legacyField />
    <ComponentLimit readOnly={readOnly} />
  </>
);
