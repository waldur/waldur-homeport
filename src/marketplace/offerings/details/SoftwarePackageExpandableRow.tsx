import { PuzzlePieceIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  NestedParentSoftware,
  Offering,
  SoftwarePackage,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

const SoftwarePackageList: FC<{ packages: NestedParentSoftware[] }> = ({
  packages,
}) => (
  <>
    {packages.map((pkg, idx) => (
      <span key={pkg.uuid}>
        {idx > 0 && ', '}
        {pkg.name}
        {pkg.versions?.length > 0 && (
          <span className="text-muted"> ({pkg.versions.join(', ')})</span>
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
  const enabledCpuFamily =
    offering?.software_catalogs?.flatMap((sc) => sc.enabled_cpu_family || []) ||
    [];
  const enabledCpuMicroarchitectures =
    offering?.software_catalogs?.flatMap(
      (sc) => sc.enabled_cpu_microarchitectures || [],
    ) || [];

  const filteredVersions =
    row.versions
      ?.filter((version) => {
        if (!version.targets || version.targets.length === 0) return false;
        return version.targets.some((target) => {
          const [cpuFamily, microArch] = target.target_name?.split('/') || [];
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
    <ExpandableContainer asTable style={{ marginLeft: 46 }}>
      {categories?.length > 0 && (
        <Field label={translate('Categories')} labelWidth={140}>
          <div className="d-flex flex-wrap gap-1">
            {categories.map((cat) => (
              <Badge key={cat} variant="info" light>
                {cat}
              </Badge>
            ))}
          </div>
        </Field>
      )}

      {row.parent_softwares?.length > 0 && (
        <Field label={translate('Extends')} labelWidth={140}>
          <SoftwarePackageList packages={row.parent_softwares} />
        </Field>
      )}

      {filteredVersions.length > 0 && (
        <Field label={translate('Versions')} labelWidth={140}>
          {filteredVersions.map((version) => version.version).join(', ')}
        </Field>
      )}

      {filteredVersions.length > 0 && (
        <Field label={translate('Load command')} labelWidth={140}>
          {filteredVersions.map((version, idx) => {
            const cmd = `module load ${row.name}/${version.version}`;
            return (
              <span key={version.uuid}>
                {idx > 0 && ', '}
                {cmd}
                <CopyToClipboardButton
                  value={cmd}
                  onlyButton
                  className="ms-1"
                />
              </span>
            );
          })}
        </Field>
      )}

      {row.extension_count > 0 && (
        <Field label={translate('Extensions available')} labelWidth={140}>
          <span className="text-info">
            <PuzzlePieceIcon className="me-1" weight="bold" />
            {row.extension_count}
          </span>
        </Field>
      )}

      {row.extensions?.length > 0 && (
        <Field label={translate('Extensions')} labelWidth={140}>
          <SoftwarePackageList packages={row.extensions} />
        </Field>
      )}
    </ExpandableContainer>
  );
};
