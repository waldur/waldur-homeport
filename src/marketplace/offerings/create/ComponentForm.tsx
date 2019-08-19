import * as React from 'react';

import { ArticleCodeField } from '../ArticleCodeField';
import { DisplayNameField } from '../DisplayNameField';
import { InternalNameField } from '../InternalNameField';
import { ProductCodeField } from '../ProductCodeField';
import { ComponentAccountingTypeField } from './ComponentAccountingTypeField';
import { ComponentLimit } from './ComponentLimit';
import { ComponentMeasuredUnitField } from './ComponentMeasuredUnitField';

interface Props {
  component: string;
  removeOfferingQuotas(): void;
}

export const ComponentForm = (props: Props) => (
  <>
    <InternalNameField name={`${props.component}.type`}/>
    <DisplayNameField name={`${props.component}.name`}/>
    <ComponentMeasuredUnitField component={props.component}/>
    <ComponentAccountingTypeField
      component={props.component}
      removeOfferingQuotas={props.removeOfferingQuotas}
    />
    <ArticleCodeField name={`${props.component}.article_code`}/>
    <ProductCodeField name={`${props.component}.product_code`}/>
    <ComponentLimit component={props.component}/>
  </>
);
