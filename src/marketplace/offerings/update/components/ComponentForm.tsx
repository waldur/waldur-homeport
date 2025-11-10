import { ProviderOfferingDetails } from 'waldur-js-client';

import { ArticleCodeField } from '../../ArticleCodeField';
import { DisplayNameField } from '../../DisplayNameField';
import { InternalNameField } from '../../InternalNameField';

import { ComponentAccountingTypeField } from './ComponentAccountingTypeField';
import { ComponentLimit } from './ComponentLimit';
import { ComponentMeasuredUnitField } from './ComponentMeasuredUnitField';
import { ComponentPrepaidFieldGroup } from './ComponentPrepaidFieldGroup';

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
    <ComponentMeasuredUnitField readOnly={readOnly} />
    <ComponentAccountingTypeField readOnly={readOnly} />
    <ArticleCodeField legacyField />
    <ComponentPrepaidFieldGroup offering={offering} />
    <ComponentLimit readOnly={readOnly} />
  </>
);
