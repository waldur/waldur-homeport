import { PuzzlePieceIcon } from '@phosphor-icons/react';
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
        // Parse target_name which should be in format "cpu_family/microarchitecture"
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
                <div key={version.uuid} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-bold text-primary fs-6">
                      {version.version}
                    </div>
                    {version.release_date && (
                      <small className="text-muted">
                        {new Date(version.release_date).toLocaleDateString()}
                      </small>
                    )}
                  </div>

                  {version.targets && version.targets.length > 0 && (
                    <div className="mt-2">
                      <div className="fw-semibold text-muted small mb-1">
                        {translate('Available Targets')}:
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {version.targets
                          .filter((target) => {
                            const [cpuFamily, microArch] =
                              target.target_name?.split('/') || [];
                            return (
                              (enabledCpuFamily.length === 0 ||
                                enabledCpuFamily.includes(cpuFamily)) &&
                              (enabledCpuMicroarchitectures.length === 0 ||
                                enabledCpuMicroarchitectures.includes(
                                  microArch,
                                ))
                            );
                          })
                          .map((target) => (
                            <>
                              <span
                                key={target.uuid}
                                className="badge badge-light-secondary"
                                title={target.target_type || 'Software target'}
                              >
                                {target.target_name ||
                                  `${target.target_type}/${target.target_subtype || 'unknown'}`}
                              </span>
                              {(
                                target.gpu_architectures as string[] | undefined
                              )?.map((gpuArch) => (
                                <span
                                  key={`${target.uuid}-gpu-${gpuArch}`}
                                  className="badge badge-light-warning"
                                  title={translate('GPU architecture')}
                                >
                                  {gpuArch}
                                </span>
                              ))}
                            </>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2">
                    <CopyToClipboardContainer
                      value={`module load ${row.name}/${version.version}`}
                      maxWidth="none"
                    />
                  </div>
                </div>
              ))}
            </div>
          }
        />
      )}

      {row.extension_count > 0 && (
        <Field
          label={translate('Extensions')}
          value={
            <div className="text-info">
              <PuzzlePieceIcon className="me-1" weight="bold" />
              {translate('{count} extension packages available', {
                count: row.extension_count,
              })}
            </div>
          }
        />
      )}
    </ExpandableContainer>
  );
};
