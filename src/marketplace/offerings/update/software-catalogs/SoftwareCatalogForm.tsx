import { FunctionComponent, useMemo } from 'react';
import { marketplaceSoftwareCatalogsList, Offering } from 'waldur-js-client';

import { SelectGroup, AsyncSelectGroup } from '@/form';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';

// Architecture options with target counts
const ARCHITECTURE_OPTIONS = [
  { value: 'aarch64', label: 'aarch64 - ARM 64-bit architecture' },
  { value: 'x86_64', label: 'x86_64 - Intel/AMD 64-bit architecture' },
];

// Platform options with target counts - expanded with Intel, AMD, and ARM specific variants
const PLATFORM_OPTIONS = [
  { value: 'generic', label: 'generic - Generic platform optimization' },
  // Intel-specific microarchitectures
  { value: 'haswell', label: 'haswell - Intel Haswell and newer' },
  {
    value: 'skylake_avx512',
    label: 'skylake_avx512 - Intel Skylake with AVX-512',
  },
  // AMD-specific microarchitectures
  { value: 'zen2', label: 'zen2 - AMD Zen2 architecture' },
  { value: 'zen3', label: 'zen3 - AMD Zen3 architecture' },
  // ARM-specific microarchitectures
  { value: 'neoverse_n1', label: 'neoverse_n1 - ARM Neoverse N1 cores' },
  { value: 'neoverse_v1', label: 'neoverse_v1 - ARM Neoverse V1 cores' },
  { value: 'a64fx', label: 'a64fx - Fujitsu A64FX cores' },
];

// Function for loading software catalogs
const loadCatalogs = createLoadOptions(marketplaceSoftwareCatalogsList, 'name');

export const SoftwareCatalogForm: FunctionComponent<{
  isEdit?: boolean;
  initialCatalog?: any;
  offering?: Offering;
}> = ({ isEdit = false, initialCatalog, offering }) => {
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
      />
      <SelectGroup
        name="enabled_cpu_family"
        label={translate('Enabled CPU family')}
        placeholder={translate('Select CPU family...')}
        options={ARCHITECTURE_OPTIONS}
        isMulti
        isClearable
        simpleValue
      />
      <SelectGroup
        name="enabled_cpu_microarchitectures"
        label={translate('Enabled CPU microarchitecture')}
        placeholder={translate('Select CPU microarchitecture...')}
        options={PLATFORM_OPTIONS}
        isMulti
        isClearable
        simpleValue
      />
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
