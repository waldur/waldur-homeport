import { FunctionComponent, useMemo } from 'react';
import { useForm } from 'react-final-form';
import { marketplaceSoftwareCatalogsList, Offering } from 'waldur-js-client';

import { AsyncSelectGroup, SelectGroup } from '@/form';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';

import { SoftwareCatalogCpuTargetFields } from './SoftwareCatalogCpuTargetFields';

const loadCatalogs = createLoadOptions(marketplaceSoftwareCatalogsList, 'name');

export const SoftwareCatalogForm: FunctionComponent<{
  isEdit?: boolean;
  initialCatalog?: any;
  offering?: Offering;
}> = ({ isEdit = false, initialCatalog, offering }) => {
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
        getOptionLabel={(option) =>
          `${option.name} ${option.version} (${option.package_count} packages) - ${option.catalog_type_display || option.catalog_type || 'Unknown type'}`
        }
        disabled={isEdit}
        noOptionsMessage={() => translate('No results found')}
        format={(value) =>
          isEdit && initialCatalog && !value
            ? {
                ...initialCatalog,
                label: `${initialCatalog.name} ${initialCatalog.version}${initialCatalog.package_count ? ` (${initialCatalog.package_count} packages)` : ''} - ${initialCatalog.catalog_type_display || initialCatalog.catalog_type || 'Unknown type'}`,
              }
            : value
        }
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
