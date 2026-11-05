import { ArrowClockwiseIcon, PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { Field, Form, useForm, useFormState } from 'react-final-form';
import {
  HpcPartition,
  HpcSoftware,
  HpcJobSubmitResponse,
  hpcWorkspacesJobs,
  hpcWorkspacesPreviewScript,
  hpcWorkspacesSoftwareList,
  Resource,
} from 'waldur-js-client';

import {
  AlertItem,
  AsyncSelect,
  BaseButton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'waldur-ui';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { useDebouncedValue } from '@/core/useDebouncedValue';
import { formatFilesize } from '@/core/utils';
import { composeValidators, required } from '@/core/validators';
import {
  BaseStringField,
  NumberGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { MonacoField } from '@/form/MonacoField';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { HpcErrorAlert } from './HpcErrorAlert';
import { HPC_QUERY_OPTIONS, hpcQueryKey, useHpcPartitions } from './queries';
import {
  buildJobSpec,
  formatMinutes,
  getHpcErrorMessage,
  JobFormValues,
  addSoftwareToScript,
  getGeneratedHeader,
  splitJobScript,
} from './utils';

// The script editor's look (editor gutter, header strip), shared with offerings.
import '@/marketplace/offerings/update/integration/EditScriptDialog.scss';

const PREVIEW_DEBOUNCE_MS = 600;

const SCRIPT_PLACEHOLDER = `module load GROMACS/2024.1-foss-2023b

srun gmx_mpi mdrun -deffnm md
`;

const INITIAL_VALUES: JobFormValues = {
  nodes: 1,
  ntasks_per_node: 1,
  cpus_per_task: 1,
  time_limit_minutes: 60,
  gpus_per_node: 0,
  script: SCRIPT_PLACEHOLDER,
};

const JOB_NAME_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

const validateJobName = (value?: string) =>
  value && !JOB_NAME_PATTERN.test(value)
    ? translate(
        'Use up to 128 letters, digits, dots, dashes and underscores, without spaces.',
      )
    : undefined;

const AUTO_FIELDS = ['partition', 'qos'];

const validateScript = (script?: string) =>
  splitJobScript(script).commands
    ? undefined
    : translate('Add the commands to run after the setup lines.');

const getPartitionHint = (partition?: HpcPartition): string | undefined => {
  if (!partition) return undefined;
  const hints = [
    partition.max_time !== null &&
      translate('max time {time}', { time: formatMinutes(partition.max_time) }),
    partition.max_nodes !== null &&
      translate('max {count} nodes', { count: partition.max_nodes }),
    partition.max_cpus_per_node !== null &&
      translate('max {count} CPUs per node', {
        count: partition.max_cpus_per_node,
      }),
    partition.max_mem_per_node &&
      translate('max {memory} memory per node', {
        memory: formatFilesize(partition.max_mem_per_node),
      }),
    partition.total_nodes !== null &&
      translate('{idle} of {total} nodes idle', {
        idle: partition.idle_nodes ?? '?',
        total: partition.total_nodes,
      }),
    partition.gpu_arch && translate('GPU {arch}', { arch: partition.gpu_arch }),
  ].filter(Boolean);
  return hints.length ? hints.join(' · ') : undefined;
};

interface PreviewState {
  script?: string;
  errors: string[];
  warnings: string[];
  loading: boolean;
  /** The preview is for the values on screen. */
  current: boolean;
}

/** The script for the values on screen, rendered and checked by the backend. */
const useScriptPreview = (
  resourceUuid: string,
  values: JobFormValues,
): PreviewState => {
  const spec = buildJobSpec(values);
  const ready = Boolean(spec.name && spec.commands.trim());
  const specJson = JSON.stringify(spec);
  const debouncedJson = useDebouncedValue(specJson, PREVIEW_DEBOUNCE_MS);
  const { data, error, isFetching } = useQuery({
    queryKey: hpcQueryKey(resourceUuid, 'preview', debouncedJson),
    queryFn: ({ signal }) =>
      hpcWorkspacesPreviewScript({
        path: { uuid: resourceUuid },
        body: JSON.parse(debouncedJson),
        signal,
      }).then((response) => response.data),
    enabled: ready && debouncedJson === specJson,
    placeholderData: (previous) => previous,
    ...HPC_QUERY_OPTIONS,
    retry: false,
  });
  if (!ready) {
    return {
      errors: [],
      warnings: [],
      loading: false,
      current: false,
    };
  }
  return {
    script: data?.script,
    // A refused spec (a malformed name or setup line) comes back as a 400.
    errors: error ? [getHpcErrorMessage(error)] : data?.errors || [],
    warnings: data?.warnings || [],
    loading: isFetching || debouncedJson !== specJson,
    current:
      !isFetching && debouncedJson === specJson && Boolean(data || error),
  };
};

const SoftwarePicker: FC<{
  resourceUuid: string;
  partition?: string;
  onSelect(software: HpcSoftware): void;
}> = ({ resourceUuid, partition, onSelect }) => {
  const loadOptions = useCallback(
    (query: string) =>
      (query.trim()
        ? hpcWorkspacesSoftwareList({
            path: { uuid: resourceUuid },
            query: { query: query.trim(), partition: partition || undefined },
          })
            .then((response) => response.data)
            .catch(() => [] as HpcSoftware[])
        : Promise.resolve([] as HpcSoftware[])
      ).then((options) => ({ options, hasMore: false })),
    [resourceUuid, partition],
  );
  return (
    <div className="w-[300px]">
      <AsyncSelect
        key={partition || 'all'}
        placeholder={translate('Add software...')}
        loadOptions={loadOptions}
        value={null}
        onChange={(option: HpcSoftware | null) => option && onSelect(option)}
        getOptionValue={(option: HpcSoftware) =>
          `${option.catalog}:${option.name}/${option.version}`
        }
        getOptionLabel={(option: HpcSoftware) =>
          `${option.name} ${option.version} (${option.catalog})`
        }
        noOptionsMessage={({ inputValue }) =>
          inputValue
            ? translate('No software found')
            : translate('Type to search the cluster catalogs')
        }
        aria-label={translate('Add software')}
      />
    </div>
  );
};

const Messages: FC<{ preview: PreviewState }> = ({ preview }) => (
  <>
    {preview.errors.length > 0 && (
      <AlertItem
        variant="error"
        type="floating"
        className="mb-4"
        title={translate('The job does not fit the cluster limits')}
        body={
          <ul className="mb-0 ps-4">
            {preview.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        }
      />
    )}
    {preview.warnings.length > 0 && (
      <AlertItem
        variant="warning"
        type="floating"
        className="mb-4"
        title={translate('Warnings')}
        body={
          <ul className="mb-0 ps-4">
            {preview.warnings.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        }
      />
    )}
  </>
);

/**
 * The tinted header strip of the dialog's two cards, edge to edge (CardHeader
 * is inset by margins otherwise), title above description. 77px is the job
 * script header's height with its one-line description, so both strips line up.
 */
const TINTED_HEADER_CLASS =
  'mx-0 min-h-[77px] flex-col items-start justify-center bg-secondary px-[1.85rem] py-3';

const GeneratedHeader: FC<{ script?: string }> = ({ script }) => {
  const header = getGeneratedHeader(script);
  return (
    <pre className="mb-0 px-[1.85rem] py-3 text-xs text-tertiary bg-secondary border-b border-b-secondary overflow-x-auto">
      {header.length
        ? header.join('\n')
        : translate(
            '#!/bin/bash\n# The #SBATCH options appear here once the job has a name and commands.',
          )}
    </pre>
  );
};

const ResourcesCard: FC<{ partition?: HpcPartition }> = ({ partition }) => (
  <Card bordered className="overflow-hidden">
    <CardHeader className={TINTED_HEADER_CLASS}>
      <CardTitle className="text-base font-semibold text-primary">
        {translate('Resources')}
      </CardTitle>
    </CardHeader>
    <CardContent className="px-[1.85rem] py-4">
      <div className="grid gap-x-4 grid-cols-2">
        <NumberGroup
          name="nodes"
          label={translate('Nodes')}
          min={1}
          max={partition?.max_nodes ?? undefined}
        />
        <NumberGroup
          name="gpus_per_node"
          label={translate('GPUs per node')}
          min={0}
        />
        <NumberGroup
          name="ntasks_per_node"
          label={translate('Tasks per node')}
          min={1}
        />
        <NumberGroup
          name="cpus_per_task"
          label={translate('CPUs per task')}
          min={1}
        />
        <NumberGroup
          name="time_limit_minutes"
          label={translate('Time (min)')}
          min={1}
          max={partition?.max_time ?? undefined}
        />
        <NumberGroup
          name="memory_mb"
          label={translate('Memory (MB)')}
          min={1}
          placeholder={translate('Default')}
        />
      </div>
      <StringGroup
        name="working_directory"
        label={translate('Working directory')}
        placeholder={translate('Home directory')}
        spaceless
      />
    </CardContent>
  </Card>
);

const SubmitJobForm: FC<{
  resource: Resource;
  submitting: boolean;
  handleSubmit(): void;
}> = ({ resource, submitting, handleSubmit }) => {
  const form = useForm<JobFormValues>();
  const { values, invalid, errors, dirtyFields } = useFormState<JobFormValues>({
    subscription: {
      values: true,
      invalid: true,
      errors: true,
      dirtyFields: true,
    },
  });
  // The dialog picks the partition and its QoS itself; only the user's own
  // edits count as changes worth confirming or resetting.
  const dirty = Object.keys(dirtyFields).some(
    (name) => dirtyFields[name] && !AUTO_FIELDS.includes(name),
  );
  const { closeDialog, confirm } = useModal();
  const { data: partitions, error: partitionsError } = useHpcPartitions(
    resource.uuid,
  );

  const selectable = useMemo(
    () => (partitions || []).filter((partition) => partition.published),
    [partitions],
  );
  const partitionOptions = useMemo(
    () => selectable.map((item) => ({ value: item.name, label: item.name })),
    [selectable],
  );
  const partition = selectable.find((item) => item.name === values.partition);
  const qosOptions = useMemo(
    () => (partition?.qos || []).map((qos) => ({ value: qos, label: qos })),
    [partition],
  );

  // Start on the first published partition once the list arrives.
  useEffect(() => {
    if (!values.partition && selectable.length) {
      form.change('partition', selectable[0].name);
    }
  }, [values.partition, selectable, form]);

  // A partition brings its own QoS list: preselect its default.
  const previousPartition = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (values.partition === previousPartition.current) return;
    previousPartition.current = values.partition;
    form.change('qos', partition?.default_qos || undefined);
  }, [values.partition, partition, form]);

  const preview = useScriptPreview(resource.uuid, values);
  const blockedReason = errors?.name
    ? translate('Name the job: {reason}', { reason: errors.name })
    : errors?.script
      ? String(errors.script)
      : preview.errors.length
        ? translate('Fix the errors shown above first.')
        : !preview.current
          ? translate('Wait for the batch script to update.')
          : undefined;

  const addSoftware = useCallback(
    (software: HpcSoftware) =>
      form.change('script', addSoftwareToScript(values.script, software)),
    [form, values.script],
  );

  const close = useCallback(async () => {
    if (dirty) {
      try {
        await confirm(
          translate('Unsaved changes'),
          translate('Discard this job script?'),
          {
            size: 'sm',
            negativeButton: translate('Discard and exit'),
            positiveButton: translate('Keep editing'),
          },
        );
        return; // keep editing
      } catch {
        // discard
      }
    }
    closeDialog();
  }, [dirty, confirm, closeDialog]);

  return (
    <ModalDialog
      title={translate('Submit job')}
      subtitle={
        <ScopeSubtitle label={translate('Allocation')} name={resource.name} />
      }
      onHide={close}
      bodyClassName="py-0"
      extraClassName="editor-header gap-4 py-5"
      extra={
        <div className="flex flex-wrap items-center gap-4">
          <Field
            name="name"
            validate={composeValidators(required, validateJobName)}
          >
            {({ input, meta }) => (
              <div className="w-[250px]">
                <BaseStringField
                  {...input}
                  aria-label={translate('Job name')}
                  placeholder={translate('Job name')}
                  isInvalid={meta.touched && Boolean(meta.error)}
                  title={meta.touched ? meta.error : undefined}
                />
              </div>
            )}
          </Field>
          <div className="w-[200px]">
            <Select
              aria-label={translate('Partition')}
              options={partitionOptions}
              value={partitionOptions.find(
                (option) => option.value === values.partition,
              )}
              onChange={(option) =>
                option && form.change('partition', option.value)
              }
              isClearable={false}
              placeholder={translate('Partition')}
            />
          </div>
          <div className="w-[150px]">
            <Select
              aria-label={translate('QoS')}
              options={qosOptions}
              value={qosOptions.find((option) => option.value === values.qos)}
              onChange={(option) => form.change('qos', option?.value)}
              isDisabled={!qosOptions.length}
              isClearable
              placeholder={translate('QoS')}
            />
          </div>
          <SoftwarePicker
            resourceUuid={resource.uuid}
            partition={values.partition}
            onSelect={addSoftware}
          />
          <BaseButton
            variant="secondary"
            size="lg"
            onClick={() => form.reset()}
            disabled={!dirty || submitting}
            disabledReason={translate('There are no changes to reset')}
            iconNode={<ArrowClockwiseIcon weight="bold" />}
            label={translate('Reset')}
          />
          {partition && (
            <span className="text-tertiary text-xs">
              {getPartitionHint(partition)}
            </span>
          )}
        </div>
      }
      footer={
        <div className="grow">
          <Messages preview={preview} />
          <div className="flex justify-end gap-4">
            <BaseButton
              variant="tertiary"
              size="lg"
              onClick={close}
              disabled={submitting}
              disabledReason={translate('Submission in progress')}
              label={translate('Cancel')}
            />
            <SubmitButton
              submitting={submitting}
              disabled={invalid || Boolean(blockedReason)}
              disabledReason={blockedReason}
              label={translate('Submit')}
              type="button"
              onClick={handleSubmit}
              iconNode={<PaperPlaneTiltIcon weight="bold" />}
            />
          </div>
        </div>
      }
    >
      <HpcErrorAlert error={partitionsError} />
      <div className="script-editor grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card bordered className="overflow-hidden">
          <CardHeader className={classNames(TINTED_HEADER_CLASS, 'gap-1')}>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
              {translate('Job script')}
              {preview.loading && <LoadingSpinnerSimple />}
            </CardTitle>
            <CardDescription className="text-xs text-tertiary">
              {translate(
                "The grayed lines come from the form. Below them: setup lines ('module …', 'spack …', 'source …'), then the commands.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <GeneratedHeader script={preview.script} />
            <Field name="script" validate={validateScript}>
              {({ input }) => (
                <MonacoField input={input} language="shell" height={300} />
              )}
            </Field>
          </CardContent>
        </Card>
        <ResourcesCard partition={partition} />
      </div>
    </ModalDialog>
  );
};

export const HpcSubmitJobDialog: FC<{
  resolve: { resource: Resource; refetch(): void };
}> = ({ resolve: { resource, refetch } }) => {
  const { showError, showSuccess } = useNotify();

  const mutation = useManagedMutation<
    HpcJobSubmitResponse,
    unknown,
    JobFormValues
  >({
    mutationFn: (values) =>
      hpcWorkspacesJobs({
        path: { uuid: resource.uuid },
        body: buildJobSpec(values),
      }).then((response) => response.data),
    refetch,
    onSuccess: (result) => {
      showSuccess(
        translate('Job {id} submitted', { id: result.job_id }),
        result.warnings?.length ? result.warnings.join(' ') : undefined,
      );
    },
    onError: (error) =>
      showError(
        translate('Unable to submit the job: {reason}', {
          reason: getHpcErrorMessage(error),
        }),
      ),
  });

  return (
    <Form<JobFormValues>
      onSubmit={(values) =>
        // Failures are reported in onError; keep the dialog open.
        mutation.mutateAsync(values).catch(() => undefined)
      }
      initialValues={INITIAL_VALUES}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <SubmitJobForm
            resource={resource}
            submitting={submitting}
            handleSubmit={handleSubmit}
          />
        </form>
      )}
    />
  );
};
