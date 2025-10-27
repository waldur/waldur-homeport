import { FC } from 'react';
import { Offering, SoftwarePackage } from 'waldur-js-client';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

interface OwnProps {
  row: SoftwarePackage;
  offering?: Offering; // Offering to get enabled cpu family/microarchitectures
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

  // Filter and sort versions - latest to oldest
  const filteredVersions =
    row.versions
      ?.filter((version) => {
        if (!version.targets || version.targets.length === 0) return false;

        // Check if version has targets matching enabled cpu family/microarchitectures
        return version.targets.some(
          (target) =>
            (enabledCpuFamily.length === 0 ||
              enabledCpuFamily.includes(target.cpu_family)) &&
            (enabledCpuMicroarchitectures.length === 0 ||
              enabledCpuMicroarchitectures.includes(
                target.cpu_microarchitecture,
              )),
        );
      })
      .sort((a, b) => {
        // Sort by version string (latest to oldest)
        return b.version.localeCompare(a.version, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }) || [];

  return (
    <ExpandableContainer hasMultiSelect asTable>
      <Field
        label={translate('Description')}
        value={
          row.description ? (
            <SafeMarkdown text={row.description} />
          ) : (
            <span className="text-muted">
              {translate('No description available')}
            </span>
          )
        }
      />

      {filteredVersions.length > 0 && (
        <Field
          label={translate('Available Versions')}
          value={
            <div className="mt-2">
              {filteredVersions.map((version) => (
                <div key={version.uuid} className="mb-2 p-2 border rounded">
                  <div className="fw-bold">
                    <CopyToClipboardContainer
                      value={`module load ${version.version}`}
                      maxWidth="none"
                    />
                  </div>
                </div>
              ))}
            </div>
          }
        />
      )}
    </ExpandableContainer>
  );
};
