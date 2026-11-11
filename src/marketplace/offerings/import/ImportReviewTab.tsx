import { useMemo } from 'react';
import { useFormState } from 'react-final-form';

import {
  PropertyList,
  PropertyItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
} from 'waldur-ui';

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
        <label className="text-secondary font-semibold mb-3">
          {translate('Selected mappings')}:
        </label>
        <Table className="align-middle mb-2.5">
          <TableHeader>
            <TableRow>
              <TableHead>{translate('Remote category')}</TableHead>
              <TableHead>{translate('Offerings')}</TableHead>
              <TableHead>{translate('Local category')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((data) => (
              <TableRow key={data.uuid}>
                <TableCell>{data.remote_category}</TableCell>
                <TableCell>
                  <Tooltip label={data.offering}>
                    <span>{data.offering}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>{data.local_category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
