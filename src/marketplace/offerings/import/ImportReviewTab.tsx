import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

import { importOfferingSelector } from './selectors';

export const ImportReviewTab = () => {
  const formData = useSelector(importOfferingSelector);

  const tableData = useMemo(() => {
    return formData.offerings.map((offering) => {
      const categoryMap = formData.categories_set.find(
        (map) => map.remote_category === offering.category_title,
      );
      return {
        uuid: offering.uuid,
        offering: offering.name,
        remote_category: categoryMap.remote_category,
        local_category: categoryMap.local_category.title,
      };
    });
  }, [formData]);

  if (!formData?.customer) return null;

  return (
    <div className="d-flex flex-column gap-1">
      <Field
        label={translate('Organization')}
        value={renderFieldOrDash(formData.customer.name)}
        labelClass="fw-bolder"
      />

      <Field
        label={translate('Offerings')}
        value={renderFieldOrDash(
          formData.offerings.map((o) => o.name).join(', '),
        )}
        labelClass="fw-bolder"
      />

      <div>
        <label className="field-label text-gray-700 fw-bolder mb-4">
          {translate('Selected mappings')}:
        </label>
        <table className="table align-middle table-row-bordered mb-3">
          <thead>
            <tr className="text-muted fs-7 fw-bold">
              <td>{translate('Remote category')}</td>
              <td>{translate('Offerings')}</td>
              <td>{translate('Local category')}</td>
            </tr>
          </thead>
          <tbody className="fs-6">
            {tableData.map((data) => (
              <tr key={data.uuid}>
                <td className="text-dark">{data.remote_category}</td>
                <td className="text-dark">
                  <Tip id={`tip-offering-${data.uuid}`} label={data.offering}>
                    {data.offering}
                  </Tip>
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
