import { useMemo } from 'react';
import { useFormState } from 'react-final-form';

import { PropertyList, Tooltip, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { OfferingImportFormData } from './types';

export const ImportReviewTab = () => {
  const { values: formData } = useFormState<OfferingImportFormData>();

  const tableData = useMemo(() => {
    return formData.offerings.map((offering) => {
      const categoryMap = formData.categories_set.find(
        (map) => map.remote_category === offering.category_title,
      );
      return {
        uuid: offering.uuid,
        offering: offering.name,
        remote_category: categoryMap?.remote_category,
        local_category: categoryMap?.local_category?.title,
      };
    });
  }, [formData]);

  if (!formData?.customer) return null;

  return (
    <div className="flex flex-col gap-1">
      <PropertyList
        variant="summary"
        className="flex flex-col gap-1"
        labelClass="font-semibold"
      >
        <PropertyItem
          label={translate('Organization')}
          value={formData.customer.name}
          hideIfEmpty={false}
        />

        <PropertyItem
          label={translate('Offerings')}
          value={propVal.list(formData.offerings.map((o) => o.name))}
          hideIfEmpty={false}
        />
      </PropertyList>

      <div>
        <label className="field-label text-secondary font-semibold mb-3">
          {translate('Selected mappings')}:
        </label>
        <table className="table align-middle table-row-bordered mb-2.5">
          <thead>
            <tr className="text-quaternary text-xs font-medium">
              <td>{translate('Remote category')}</td>
              <td>{translate('Offerings')}</td>
              <td>{translate('Local category')}</td>
            </tr>
          </thead>
          <tbody className="text-sm">
            {tableData.map((data) => (
              <tr key={data.uuid}>
                <td className="text-primary">{data.remote_category}</td>
                <td className="text-primary">
                  <Tooltip label={data.offering}>
                    <span>{data.offering}</span>
                  </Tooltip>
                </td>
                <td>{data.local_category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
