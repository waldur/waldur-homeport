import { FactoryIcon } from '@phosphor-icons/react';
import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFormState } from 'react-final-form';
import { Project, Resource } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate, parseDate } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { truncate } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ProjectPreviewExpandableRow } from './ProjectPreviewExpandableRow';
import { SkipErrorsCheck } from './SkipErrorsCheck';
import { ProjectImportFormData } from './types';
import { parseProjectsAndResourcesFile } from './utils';

// A row parsed from the imported CSV file — not an API Project. It borrows a
// few field names from the SDK model but carries free-form, file-derived data.
interface ImportedProject extends Pick<
  Project,
  'name' | 'uuid' | 'description'
> {
  resources?: Resource[];
  project_type?: string;
  start_date?: string;
  end_date?: string;
  customer_uuid?: string;
  oecd_fos_2007_code?: string;
  is_industry?: boolean;
}

const ExpandableRow = (columns) =>
  memo(({ row }: { row: any }) => (
    <ProjectPreviewExpandableRow row={row} columns={columns} />
  ));

interface Step5Props {
  context: {
    skipErrors: boolean;
    setSkipErrors: (val: boolean) => void;
    setStepValidation?: (
      stepKey: string,
      valid: boolean,
      tooltipMessage: string | null,
    ) => void;
  };
}

export const Step5PreviewAndImport: FC<Step5Props> = ({
  context: { skipErrors, setSkipErrors, setStepValidation },
}) => {
  const { showError } = useNotify();
  const { values } = useFormState<ProjectImportFormData>();
  const importType = values?.import_type;
  const offering = values?.offering;
  const file = values?.file;

  const [data, setData] = useState<ImportedProject[]>([]);

  const resourcesCount = useMemo(
    () =>
      data.reduce(
        (count, project) => count + (project?.resources?.length || 0),
        0,
      ),
    [data],
  );

  const parseCsvFile = useCallback(
    (acceptedFiles: File[]) => {
      const _file = acceptedFiles[0];
      if (!_file) {
        showError(translate('No file has been imported'));
        return;
      }
      parseProjectsAndResourcesFile(_file)
        .then((_data) => {
          setData(_data);
        })
        .catch((err) => {
          showError(err.message || String(err));
        });
    },
    [showError],
  );

  useEffect(() => {
    if (file?.length) {
      parseCsvFile(file);
    }
  }, [file, parseCsvFile]);

  const refToolbar = useRef<HTMLDivElement>(null);

  const cacheFilter = useMemo(
    () => ({ dataLength: data.length }),
    [data.length],
  );

  const tableProps = useTable({
    table: 'ImportProjectsPreview',
    fetchData: (request) => {
      let rows = [...data];
      const q = (request.filter?.query || '').trim().toLowerCase();
      if (q) {
        rows = rows.filter(
          (row) => row.name && row.name.toLowerCase().includes(q),
        );
      }
      return Promise.resolve({
        rows,
        resultCount: rows.length,
      });
    },
    queryField: 'query',
    filter: cacheFilter,
  });

  const projectColumns = useMemo<Column<ImportedProject>[]>(
    () =>
      [
        {
          title: translate('Project name'),
          render: ({ row }) => (
            <>
              {row.name}
              {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
                row.is_industry && (
                  <Tip
                    id={'tip-industry-' + row.uuid}
                    label={translate('Industry project')}
                    className="svg-icon svg-icon-4 ms-3"
                  >
                    <FactoryIcon weight="bold" />
                  </Tip>
                )}
            </>
          ),
        },
        data.some((project) => Boolean(project.customer_uuid)) && {
          title: translate('Organization'),
          render: ({ row }) => <>{renderFieldOrDash(row.customer_uuid)}</>,
        },
        isFeatureVisible(ProjectFeatures.show_description_in_create_dialog) &&
          data.some((project) => Boolean(project.description)) && {
            title: translate('Description'),
            render: ({ row }) => (
              <>{row.description ? truncate(row.description) : 'N/A'}</>
            ),
          },
        isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) &&
          data.some((project) => Boolean(project.oecd_fos_2007_code)) && {
            title: translate('OECD FoS code'),
            render: ({ row }) => (
              <>{renderFieldOrDash(row.oecd_fos_2007_code)}</>
            ),
          },
        isFeatureVisible(ProjectFeatures.show_type_in_create_dialog) &&
          data.some((project) => Boolean(project.project_type)) && {
            title: translate('Type'),
            render: ({ row }) => <>{renderFieldOrDash(row.project_type)}</>,
          },
        isFeatureVisible(ProjectFeatures.show_start_date_in_create_dialog) && {
          title: translate('Start date'),
          render: ({ row }) => (
            <>{row.start_date ? formatDate(row.start_date) : 'N/A'}</>
          ),
        },
        isFeatureVisible(ProjectFeatures.show_end_date_in_create_dialog) && {
          title: translate('End date'),
          render: ({ row }) => (
            <>{row.end_date ? formatDate(row.end_date) : 'N/A'}</>
          ),
        },
        {
          title: translate('Status'),
          render: ({ row }) => {
            const isOk =
              (parseDate(row.start_date).isValid ||
                !isFeatureVisible(
                  ProjectFeatures.show_start_date_in_create_dialog,
                )) &&
              (parseDate(row.end_date).isValid ||
                !isFeatureVisible(
                  ProjectFeatures.show_end_date_in_create_dialog,
                ));

            return (
              <Badge
                variant={isOk && row.name ? 'success' : 'danger'}
                pill
                outline
              >
                {!row.name
                  ? translate('Missing name')
                  : !isOk
                    ? translate('Missing date')
                    : translate('OK')}
              </Badge>
            );
          },
        },
      ].filter(Boolean) as Column<ImportedProject>[],
    [data],
  );

  const tooltip = useMemo(() => {
    if (!data?.length) {
      return translate('At least one project is required.');
    }
    const fixMessage = translate('Please fix data or skip records with errors');
    for (let i = 0; i < data.length; i++) {
      const project = data[i];
      let msg = '';
      if (!project.name) {
        msg = translate('Project name is required.');
      } else if (
        !parseDate(project.start_date).isValid &&
        isFeatureVisible(ProjectFeatures.show_start_date_in_create_dialog)
      ) {
        msg = translate('Start date is required.');
      } else if (
        !parseDate(project.end_date).isValid &&
        isFeatureVisible(ProjectFeatures.show_end_date_in_create_dialog)
      ) {
        msg = translate('End date is required.');
      }
      if (msg) return msg + ' ' + fixMessage;
    }
    return null;
  }, [data]);

  useEffect(() => {
    if (setStepValidation) {
      const isValid = !tooltip || skipErrors;
      setStepValidation('preview', isValid, !skipErrors ? tooltip : null);
    }
  }, [tooltip, skipErrors, setStepValidation]);

  const resourceColumns = useMemo(() => {
    if (importType !== 'projects_with_resources' || !offering) {
      return null;
    }
    const fields = ['description', 'end_date', 'plan_name'].filter((field) =>
      data.some(
        (project) =>
          project.resources &&
          project.resources.some((resource) => resource[field]),
      ),
    );
    return [
      {
        title: translate('Resource name'),
        render: ({ row }) => <>{row.name}</>,
      },
      fields.includes('description') && {
        title: translate('Description'),
        render: ({ row }) => (
          <>{row.description ? truncate(row.description) : 'N/A'}</>
        ),
      },
      fields.includes('end_date') && {
        title: translate('Termination date'),
        render: ({ row }) => (
          <>{row.end_date ? formatDate(row.end_date) : 'N/A'}</>
        ),
      },
      fields.includes('plan_name') && {
        title: translate('Plan'),
        render: ({ row }) => <>{renderFieldOrDash(row.plan_name)}</>,
      },
    ]
      .concat(
        (offering.components || []).map((comp) => ({
          title: comp.name,
          render: ({ row }) => (
            <>{renderFieldOrDash(row?.limits?.[comp.type])}</>
          ),
        })),
        Object.keys(offering.attributes || {}).map((attr) => ({
          title: attr,
          render: ({ row }) => (
            <>{renderFieldOrDash(row?.attributes?.[attr])}</>
          ),
        })),
      )
      .filter(Boolean) as Column<any>[];
  }, [importType, offering, data]);

  const MemoizedExpandableRow = useMemo(
    () => (resourceColumns ? ExpandableRow(resourceColumns) : undefined),
    [resourceColumns],
  );

  return (
    <div>
      <div className="d-flex justify-content-start mb-3">
        <div ref={refToolbar}>{/* Portal destination */}</div>
      </div>
      <div className="d-flex justify-content-between text-muted mb-3">
        {importType === 'projects_only' ? (
          <span>
            {data.length} {translate('Projects')}
          </span>
        ) : (
          <span>
            {data.length} {translate('Projects')}, {resourcesCount}{' '}
            {translate('Resources identified')}
          </span>
        )}
        <span>{translate('Verify your data before importing')}</span>
      </div>
      <Table
        {...tableProps}
        columns={projectColumns}
        verboseName={translate('Projects')}
        hasActionBar={false}
        fullWidth
        cardBordered={false}
        minHeight="auto"
        portal={{ toolbar: refToolbar?.current }}
        hasQuery
        expandableRow={
          importType === 'projects_with_resources'
            ? MemoizedExpandableRow
            : undefined
        }
        footer={
          Boolean(tooltip && data?.length) && (
            <SkipErrorsCheck
              checked={skipErrors}
              onChange={(e) => setSkipErrors(e.target.checked)}
            />
          )
        }
      />
    </div>
  );
};
