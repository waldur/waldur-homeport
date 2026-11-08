import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { formatComponentQuantity } from '@/marketplace/common/componentQuantity';
import {
  getRequestableComponents,
  getRowLimits,
} from '@/proposals/requestedResourceCost';
import { ProposalResource } from '@/proposals/types';
import { BooleanField } from '@/table/BooleanField';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

import { SlurmPlacementFields } from './SlurmPlacementFields';

/** An offering option's answer, as the request form took it. */
const renderOption = (value: unknown) =>
  typeof value === 'boolean' ? (
    <BooleanField value={value} />
  ) : value && typeof value === 'object' ? (
    (value as any).name || (value as any).value || JSON.stringify(value)
  ) : (
    renderFieldOrDash(value as any)
  );

/**
 * A request's details as key/value rows: where it is run, the answers to the
 * offering's options, and the amount asked for each component. The costs
 * are the table's own columns, so they are not repeated.
 */
export const ResourceRequestExpandableRow = ({
  row,
}: {
  row: ProposalResource;
}) => {
  const offering = row.requested_offering;
  const attributes = row.attributes ?? {};
  // Requested limits live on the resource itself; requests written before
  // limits moved to their own field still carry them in attributes.
  const limits = getRowLimits(row);
  const components = getRequestableComponents(offering);
  const options = offering.options;

  return (
    <ExpandableContainer>
      <PropertyList
        as="div"
        variant="summary"
        hideIfEmpty={false}
        className="flex flex-col gap-6"
      >
        <PropertyList.Section>
          <PropertyItem
            label={translate('Provider')}
            value={offering.provider_name}
          />
          <PropertyItem
            label={translate('Category')}
            value={offering.category_name}
          />
          <SlurmPlacementFields attributes={attributes} />
          {options?.order?.map((key) => (
            <PropertyItem
              key={key}
              label={options.options[key]?.label ?? key}
              value={renderOption(attributes[key])}
            />
          ))}
        </PropertyList.Section>
        {components.length > 0 ? (
          <div>
            <h6 className="mb-2.5">{translate('Requested amounts')}</h6>
            <PropertyList.Section>
              {components.map((component) => (
                <PropertyItem
                  key={component.type}
                  label={component.name}
                  value={
                    formatComponentQuantity(
                      limits[component.type],
                      component,
                    ) || translate('Not requested')
                  }
                />
              ))}
            </PropertyList.Section>
          </div>
        ) : null}
      </PropertyList>
    </ExpandableContainer>
  );
};
