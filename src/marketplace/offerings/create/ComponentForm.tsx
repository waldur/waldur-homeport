import { FunctionComponent, useContext } from 'react';

import { FormFieldsContext, FormLayoutContext } from '@waldur/form/context';
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

export const ComponentForm: FunctionComponent<ComponentFormProps> = (props) => {
  const { layout } = useContext(FormLayoutContext);
  const fieldsClassNames = {
    labelClassName: layout === 'vertical' ? '' : undefined,
    valueClassName: layout === 'vertical' ? '' : undefined,
    classNameWithoutLabel: layout === 'vertical' ? '' : undefined,
  };
  return (
    <FormFieldsContext.Provider value={fieldsClassNames}>
      <InternalNameField
        name="type"
        disabled={!!props.builtinComponents.length}
      />
      <DisplayNameField
        name="name"
        disabled={!!props.builtinComponents.length}
      />
      <ComponentMeasuredUnitField disabled={!!props.builtinComponents.length} />
      <ComponentAccountingTypeField
        removeOfferingQuotas={props.removeOfferingQuotas}
        disabled={!!props.builtinComponents.length}
      />
      <ArticleCodeField />
      <ComponentLimit />
    </FormFieldsContext.Provider>
  );
};
