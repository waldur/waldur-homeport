import { PuzzlePieceIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  NestedParentSoftware,
  Offering,
  SoftwarePackage,
} from 'waldur-js-client';

import { CopyableValue, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import {
  getOfferingEnabledCpuFamilies,
  getOfferingEnabledCpuMicroarchitectures,
} from '../softwareCatalogCpu';

const SoftwarePackageList: FC<{ packages: NestedParentSoftware[] }> = ({
  packages,
}) => (
  <>
    {packages.map((pkg, idx) => (
      <span key={pkg.uuid}>
        {idx > 0 && ', '}
        {pkg.name}
        {pkg.versions?.length > 0 && (
          <span className="text-quaternary"> ({pkg.versions.join(', ')})</span>
        )}
      </span>
    ))}
  </>
);

interface OwnProps {
  row: SoftwarePackage;
  offering?: Offering;
}

export const SoftwarePackageExpandableRow: FC<OwnProps> = ({
  row,
  offering,
}) => {
  const enabledCpuFamily = getOfferingEnabledCpuFamilies(
    offering?.software_catalogs,
  );
  const enabledCpuMicroarchitectures = getOfferingEnabledCpuMicroarchitectures(
    offering?.software_catalogs,
  );
  const hasCpuRestrictions =
    enabledCpuFamily.length > 0 || enabledCpuMicroarchitectures.length > 0;

  const filteredVersions =
    row.versions
      ?.filter((version) => {
        if (!version.targets || version.targets.length === 0) return false;
        if (!hasCpuRestrictions) {
          return true;
        }
        return version.targets.some((target) => {
          const cpuFamily = target.target_name;
          const microArch = target.target_subtype;
          if (!cpuFamily || !microArch) {
            return false;
          }
          return (
            (enabledCpuFamily.length === 0 ||
              enabledCpuFamily.includes(cpuFamily)) &&
            (enabledCpuMicroarchitectures.length === 0 ||
              enabledCpuMicroarchitectures.includes(microArch))
          );
        });
      })
      .sort((a, b) =>
        b.version.localeCompare(a.version, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      ) || [];

  const categories = row.categories as string[] | undefined;

  return (
    <ExpandableContainer asTable>
      {categories?.length > 0 && (
        <PropertyItem
          label={translate('Categories')}
          value={propVal.badgeList(categories, {
            variant: 'info',
            tone: 'outline',
          })}
        />
      )}

      {row.parent_softwares?.length > 0 && (
        <PropertyItem label={translate('Extends')}>
          <SoftwarePackageList packages={row.parent_softwares} />
        </PropertyItem>
      )}

      {filteredVersions.length > 0 && (
        <PropertyItem
          label={translate('Versions')}
          value={propVal.list(
            filteredVersions.map((version) => version.version),
          )}
        />
      )}

      {filteredVersions.length > 0 && (
        <PropertyItem label={translate('Load command')}>
          <div className="flex flex-col gap-1">
            {filteredVersions.map((version) => (
              <CopyableValue
                key={version.uuid}
                value={`module load ${row.name}/${version.version}`}
                name={translate('Load command')}
              />
            ))}
          </div>
        </PropertyItem>
      )}

      {row.extension_count > 0 && (
        <PropertyItem label={translate('Extensions available')}>
          <span className="text-info">
            <PuzzlePieceIcon className="me-1" weight="bold" />
            {row.extension_count}
          </span>
        </PropertyItem>
      )}

      {row.extensions?.length > 0 && (
        <PropertyItem label={translate('Extensions')}>
          <SoftwarePackageList packages={row.extensions} />
        </PropertyItem>
      )}
    </ExpandableContainer>
  );
};
