import { FunctionComponent } from 'react';
import { OfferingComponent } from 'waldur-js-client';

import { translate } from '@/i18n';

import { ComponentDiscountEditor } from './ComponentDiscountEditor';

interface DiscountsTableProps {
  components: OfferingComponent[];
}

export const DiscountsTable: FunctionComponent<DiscountsTableProps> = ({
  components,
}) =>
  components.length === 0 ? (
    <p className="text-muted">
      {translate('This offering has no components.')}
    </p>
  ) : (
    <>
      {components.map((component) => (
        <ComponentDiscountEditor key={component.type} component={component} />
      ))}
    </>
  );
