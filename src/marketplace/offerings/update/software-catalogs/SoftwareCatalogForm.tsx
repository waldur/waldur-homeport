import { FunctionComponent, useMemo } from 'react';
import { useForm } from 'react-final-form';
import {
  CatalogSummary,
  marketplaceSoftwareCatalogsList,
  Offering,
  SoftwareCatalog,
} from 'waldur-js-client';

import { AsyncSelectGroup, SelectGroup } from '@/form';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';

import { SoftwareCatalogCpuTargetFields } from './SoftwareCatalogCpuTargetFields';

const loadCatalogs = createLoadOptions(marketplaceSoftwareCatalogsList, 'name');

/** List options include package count and type; the offering link's catalog does not. */
const formatCatalogOptionLabel = (
  option: SoftwareCatalog | (CatalogSummary & { package_count?: number }),
) => {
  const title = [option.name, option.version].filter(Boolean).join(' ');
  const count =
    option.package_count == null
      ? ''
      : option.package_count === 1
        ? ` (${translate('1 package')})`
        : ` (${translate('{count} packages', { count: option.package_count })})`;
  const type =
    'catalog_type_display' in option
      ? option.catalog_type_display || option.catalog_type
      : undefined;
  return type ? `${title}${count} - ${type}` : `${title}${count}`;
};

export const SoftwareCatalogForm: FunctionComponent<{
  isEdit?: boolean;
  offering?: Offering;
}> = ({ isEdit = false, offering }) => {
  const form = useForm();
  const partitionOptions = useMemo(
    () =>
      (offering?.partitions || []).map((p) => ({
        label: p.partition_name,
        value: p.uuid,
      })),
    [offering],
  );
  return (
    <>
      <AsyncSelectGroup
        name="catalog"
        label={translate('Software catalog')}
        required
        placeholder={translate('Select software catalog...')}
        loadOptions={loadCatalogs}
        getOptionValue={(option) => option.uuid}
        getOptionLabel={formatCatalogOptionLabel}
        disabled={isEdit}
        noOptionsMessage={() => translate('No results found')}
        onChange={() => {
          form.batch(() => {
            form.change('enabled_cpu_family', []);
            form.change('enabled_cpu_microarchitectures', []);
          });
        }}
      />
      <SoftwareCatalogCpuTargetFields />
      <SelectGroup
        name="partition_uuid"
        options={partitionOptions}
        simpleValue
        isClearable
        placeholder={translate('Select partition...')}
        label={translate('Partition')}
      />
    </>
  );
};
