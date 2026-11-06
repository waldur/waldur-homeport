import {
  ArchiveIcon,
  ArrowClockwiseIcon,
  ArrowFatDownIcon,
  ArrowsOutCardinalIcon,
  CheckCircleIcon,
  DownloadSimpleIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  StackIcon,
} from '@phosphor-icons/react';
import JSZip from 'jszip';
import { ReactNode } from 'react';
import {
  marketplaceProviderOfferingsActivate,
  marketplaceProviderOfferingsArchive,
  marketplaceProviderOfferingsDestroy,
  marketplaceProviderOfferingsDraft,
  marketplaceProviderOfferingsExportOffering,
  marketplaceProviderOfferingsMakeAvailable,
  marketplaceProviderOfferingsMakeUnavailable,
  marketplaceProviderOfferingsRetrieve,
  marketplaceProviderOfferingsUnpause,
  OfferingExportParametersRequest,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { saveFile } from '@/core/saveFile';
import { translate } from '@/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@/marketplace-script/constants';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { generateOfferingExportYaml } from '../../list/offeringExportYaml';
import { ARCHIVED, DRAFT } from '../../store/constants';
import { getActivationErrors } from '../OfferingStateActions';

import {
  BulkOffering,
  canManageOfferingLifecycle,
  filterPermitted,
  getSharedCustomerUuid,
  getStateActionTargets,
  OfferingStateActionKey,
} from './bulkOfferingActions';
import { SelectedOfferingsSummary } from './SelectedOfferingsSummary';
import { OfferingBatchJob, useOfferingBatch } from './useOfferingBatch';

const BulkPauseOfferingsDialog = lazyComponent(() =>
  import('./BulkPauseOfferingsDialog').then((module) => ({
    default: module.BulkPauseOfferingsDialog,
  })),
);
const BulkSetOfferingGroupDialog = lazyComponent(() =>
  import('./BulkSetOfferingGroupDialog').then((module) => ({
    default: module.BulkSetOfferingGroupDialog,
  })),
);
const BulkMoveOfferingsDialog = lazyComponent(() =>
  import('./BulkMoveOfferingsDialog').then((module) => ({
    default: module.BulkMoveOfferingsDialog,
  })),
);
const ExportOfferingDialog = lazyComponent(() =>
  import('../../list/ExportOfferingDialog').then((module) => ({
    default: module.ExportOfferingDialog,
  })),
);

type Row = BulkOffering & Partial<ProviderOfferingDetails>;

/**
 * The activation checks the offering's own Activate button runs. A
 * custom-script offering also needs its create script, which the list does
 * not load (secret options stay out of list responses), so it is read here.
 */
const checkActivation = async (offering: Row) => {
  let details: Partial<ProviderOfferingDetails> = offering;
  if (offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS) {
    const response = await marketplaceProviderOfferingsRetrieve({
      path: { uuid: offering.uuid },
      query: { field: ['plans', 'type', 'secret_options'] },
    });
    details = response.data;
  }
  const errors = getActivationErrors(details);
  if (errors.length) {
    throw new Error(errors.join(' '));
  }
};

const offeringFileName = (name: string, used: Set<string>) => {
  const base = `${(name || 'offering').replace(/[\\/:*?"<>|]+/g, '_')}-export`;
  let fileName = `${base}.yaml`;
  for (let n = 2; used.has(fileName); n++) {
    fileName = `${base}-${n}.yaml`;
  }
  used.add(fileName);
  return fileName;
};

interface StateActionConfig {
  key: OfferingStateActionKey;
  title: string;
  icon: ReactNode;
  /** Why none of the selection qualifies; shown on the disabled row. */
  noneEligible: string;
  /** Sentence about the selected offerings this action leaves alone. */
  skipped(count: number): string;
  confirmTitle: string;
  confirmButton: string;
  /** What the user should know before confirming, if anything. */
  warning?: string;
  run(offering: Row): Promise<unknown>;
  successMessage(count: number): string;
  failureMessage(count: number): string;
}

export const OfferingsBulkActions = ({
  rows,
  refetch,
  table,
}: {
  rows: Row[];
  refetch(): void;
  table: string;
}) => {
  const user = useUser();
  const { openDialog, confirm } = useModal();
  const batch = useOfferingBatch({ table, refetch });
  // The export runs from its parameters dialog, which closes when it is done.
  const exportBatch = useOfferingBatch({ table, refetch, closeModal: true });
  const busy = batch.isPending || exportBatch.isPending;
  /** Why an action is disabled: a running batch first, then its own reason. */
  const reason = (own?: string | false) =>
    busy
      ? translate('Wait until the current bulk action finishes.')
      : own || undefined;

  const confirmAndRun = async (
    title: string,
    button: string,
    targets: Row[],
    skippedNote: string | undefined,
    job: Omit<OfferingBatchJob<Row>, 'offerings'>,
    {
      forDeletion = false,
      warning,
    }: { forDeletion?: boolean; warning?: string } = {},
  ) => {
    try {
      await confirm(
        title,
        <SelectedOfferingsSummary
          targets={targets}
          skippedNote={skippedNote}
          warning={warning}
        />,
        { positiveButton: button, forDeletion },
      );
    } catch {
      return;
    }
    batch.mutate({ ...job, offerings: targets });
  };

  /**
   * Says which selected offerings an action leaves alone: `sentence` for the
   * ones among `permitted` it skips (for their state, say), and a separate
   * sentence for the ones the user may not change at all.
   */
  const skippedNote = (
    targets: Row[],
    permitted: Row[],
    sentence?: (count: number) => string,
  ) => {
    const notes: string[] = [];
    if (sentence && permitted.length > targets.length) {
      notes.push(sentence(permitted.length - targets.length));
    }
    if (rows.length > permitted.length) {
      notes.push(
        translate(
          '{count} selected offering(s) are skipped: you may not change them.',
          { count: rows.length - permitted.length },
        ),
      );
    }
    return notes.length ? notes.join(' ') : undefined;
  };

  const stateActions: StateActionConfig[] = [
    {
      key: 'activate',
      title: translate('Activate'),
      icon: <CheckCircleIcon weight="bold" />,
      noneEligible: translate('None of the selected offerings is a draft.'),
      skipped: (count) =>
        translate(
          '{count} selected offering(s) are skipped: only drafts can be activated.',
          { count },
        ),
      confirmTitle: translate('Activate offerings'),
      confirmButton: translate('Activate'),
      run: async (offering) => {
        await checkActivation(offering);
        return marketplaceProviderOfferingsActivate({
          path: { uuid: offering.uuid },
        });
      },
      successMessage: (count) =>
        translate('{count} offering(s) have been activated.', { count }),
      failureMessage: (count) =>
        translate('Unable to activate {count} offering(s).', { count }),
    },
    {
      key: 'unpause',
      title: translate('Resume'),
      icon: <PlayIcon weight="bold" />,
      noneEligible: translate('None of the selected offerings is paused.'),
      skipped: (count) =>
        translate(
          '{count} selected offering(s) are skipped: only paused offerings can be resumed.',
          { count },
        ),
      confirmTitle: translate('Resume offerings'),
      confirmButton: translate('Resume'),
      run: async (offering) => {
        await checkActivation(offering);
        return marketplaceProviderOfferingsUnpause({
          path: { uuid: offering.uuid },
        });
      },
      successMessage: (count) =>
        translate('{count} offering(s) have been resumed.', { count }),
      failureMessage: (count) =>
        translate('Unable to resume {count} offering(s).', { count }),
    },
    {
      key: 'make_unavailable',
      title: translate('Set as down'),
      icon: <ArrowFatDownIcon weight="bold" />,
      noneEligible: translate('None of the selected offerings is active.'),
      skipped: (count) =>
        translate(
          '{count} selected offering(s) are skipped: only active offerings can be set as down.',
          { count },
        ),
      confirmTitle: translate('Set offerings as down'),
      confirmButton: translate('Set as down'),
      warning: translate(
        'All operations on the resources of these offerings will be blocked until the offerings are restored.',
      ),
      run: (offering) =>
        marketplaceProviderOfferingsMakeUnavailable({
          path: { uuid: offering.uuid },
        }),
      successMessage: (count) =>
        translate('{count} offering(s) have been set as down.', { count }),
      failureMessage: (count) =>
        translate('Unable to set {count} offering(s) as down.', { count }),
    },
    {
      key: 'make_available',
      title: translate('Restore'),
      icon: <ArrowClockwiseIcon weight="bold" />,
      noneEligible: translate('None of the selected offerings is down.'),
      skipped: (count) =>
        translate(
          '{count} selected offering(s) are skipped: only offerings that are down can be restored.',
          { count },
        ),
      confirmTitle: translate('Restore offerings'),
      confirmButton: translate('Restore'),
      run: (offering) =>
        marketplaceProviderOfferingsMakeAvailable({
          path: { uuid: offering.uuid },
        }),
      successMessage: (count) =>
        translate('{count} offering(s) have been restored.', { count }),
      failureMessage: (count) =>
        translate('Unable to restore {count} offering(s).', { count }),
    },
    {
      key: 'draft',
      title: translate('Set to draft'),
      icon: <PencilSimpleIcon weight="bold" />,
      noneEligible: translate('All of the selected offerings are drafts.'),
      skipped: (count) =>
        translate(
          '{count} selected offering(s) are skipped: they are drafts already.',
          { count },
        ),
      confirmTitle: translate('Set offerings to draft'),
      confirmButton: translate('Set to draft'),
      run: (offering) =>
        marketplaceProviderOfferingsDraft({ path: { uuid: offering.uuid } }),
      successMessage: (count) =>
        translate('{count} offering(s) have been set to draft.', { count }),
      failureMessage: (count) =>
        translate('Unable to set {count} offering(s) to draft.', { count }),
    },
    {
      key: 'archive',
      title: translate('Archive'),
      icon: <ArchiveIcon weight="bold" />,
      noneEligible: translate('All of the selected offerings are archived.'),
      skipped: (count) =>
        translate(
          '{count} selected offering(s) are skipped: they are archived already.',
          { count },
        ),
      confirmTitle: translate('Archive offerings'),
      confirmButton: translate('Archive'),
      run: (offering) =>
        marketplaceProviderOfferingsArchive({ path: { uuid: offering.uuid } }),
      successMessage: (count) =>
        translate('{count} offering(s) have been archived.', { count }),
      failureMessage: (count) =>
        translate('Unable to archive {count} offering(s).', { count }),
    },
  ];

  const renderStateAction = (config: StateActionConfig) => {
    const { permitted, eligible } = getStateActionTargets(
      user,
      rows,
      config.key,
    );
    if (!permitted.length) return null;
    return (
      <ActionItem
        key={config.key}
        title={config.title}
        iconNode={config.icon}
        disabled={busy || !eligible.length}
        tooltip={reason(!eligible.length && config.noneEligible)}
        action={() =>
          confirmAndRun(
            config.confirmTitle,
            config.confirmButton,
            eligible,
            skippedNote(eligible, permitted, config.skipped),
            config,
            { warning: config.warning },
          )
        }
      />
    );
  };

  // Pause takes a reason, so it opens a dialog instead of a confirmation.
  const pauseTargets = getStateActionTargets(user, rows, 'pause');
  const pauseAction = pauseTargets.permitted.length > 0 && (
    <ActionItem
      key="pause"
      title={translate('Pause')}
      iconNode={<PauseIcon weight="bold" />}
      disabled={busy || !pauseTargets.eligible.length}
      tooltip={reason(
        !pauseTargets.eligible.length &&
          translate('None of the selected offerings is active.'),
      )}
      action={() =>
        openDialog(BulkPauseOfferingsDialog, {
          resolve: {
            offerings: pauseTargets.eligible,
            skippedNote: skippedNote(
              pauseTargets.eligible,
              pauseTargets.permitted,
              (count) =>
                translate(
                  '{count} selected offering(s) are skipped: only active offerings can be paused.',
                  { count },
                ),
            ),
            table,
            refetch,
          },
        })
      }
    />
  );

  const updatable = filterPermitted(user, rows, PermissionEnum.UPDATE_OFFERING);
  // The backend refuses to change an archived offering's group.
  const groupable = updatable.filter((offering) => offering.state !== ARCHIVED);
  const sharedCustomerUuid = getSharedCustomerUuid(groupable);

  const groupAction = updatable.length > 0 && (
    <ActionItem
      key="group"
      title={translate('Set offering group')}
      iconNode={<StackIcon weight="bold" />}
      disabled={busy || !sharedCustomerUuid}
      tooltip={reason(
        !groupable.length
          ? translate('Archived offerings cannot be updated.')
          : !sharedCustomerUuid &&
              translate(
                'An offering group holds offerings of one organization. Select offerings of a single organization.',
              ),
      )}
      action={() =>
        openDialog(BulkSetOfferingGroupDialog, {
          resolve: {
            offerings: groupable,
            customerUuid: sharedCustomerUuid,
            skippedNote: skippedNote(groupable, updatable, (count) =>
              translate(
                '{count} selected offering(s) are skipped: archived offerings cannot be updated.',
                { count },
              ),
            ),
            table,
            refetch,
          },
        })
      }
    />
  );

  const moveAction = user?.is_staff && (
    <ActionItem
      key="move"
      title={translate('Move offerings')}
      iconNode={<ArrowsOutCardinalIcon weight="bold" />}
      disabled={busy}
      tooltip={reason()}
      staff
      action={() =>
        openDialog(BulkMoveOfferingsDialog, {
          resolve: { offerings: rows, table, refetch },
        })
      }
    />
  );

  const exportOfferings = (parameters: OfferingExportParametersRequest) =>
    exportBatch.submit({
      offerings: updatable,
      run: async (offering) =>
        (
          await marketplaceProviderOfferingsExportOffering({
            path: { uuid: offering.uuid },
            body: parameters,
          })
        ).data,
      onDone: async ({ succeeded, values }) => {
        if (!succeeded.length) return;
        const zip = new JSZip();
        const used = new Set<string>();
        succeeded.forEach((offering) => {
          const exported = values.get(offering) as Awaited<
            ReturnType<typeof marketplaceProviderOfferingsExportOffering>
          >['data'];
          zip.file(
            offeringFileName(exported.offering_name || offering.name, used),
            generateOfferingExportYaml(exported.export_data),
          );
        });
        saveFile(
          await zip.generateAsync({ type: 'blob' }),
          'offerings-export.zip',
        );
      },
      successMessage: (count) =>
        translate('{count} offering(s) have been exported.', { count }),
      failureMessage: (count) =>
        translate('Unable to export {count} offering(s).', { count }),
      errorMessage: translate('Unable to save the export archive.'),
    });

  const exportAction = updatable.length > 0 && (
    <ActionItem
      key="export"
      title={translate('Export')}
      iconNode={<DownloadSimpleIcon weight="bold" />}
      disabled={busy}
      tooltip={reason()}
      action={() =>
        openDialog(ExportOfferingDialog, {
          resolve: {
            count: updatable.length,
            skippedNote: skippedNote(updatable, updatable),
            onExport: exportOfferings,
          },
          size: 'lg',
        })
      }
    />
  );

  // Non-staff may delete only drafts; the backend also refuses any offering
  // with resources (or, when the offering restricts it, active ones).
  const deletable = canManageOfferingLifecycle(user)
    ? filterPermitted(user, rows, PermissionEnum.DELETE_OFFERING)
    : [];
  const deleteTargets = user?.is_staff
    ? deletable
    : deletable.filter((offering) => offering.state === DRAFT);
  const deleteAction = deletable.length > 0 && (
    <RemovalActionItem
      key="delete"
      title={translate('Delete')}
      disabled={busy || !deleteTargets.length}
      tooltip={reason(
        !deleteTargets.length &&
          translate('Only draft offerings can be deleted'),
      )}
      action={() =>
        confirmAndRun(
          translate('Delete offerings'),
          translate('Delete'),
          deleteTargets,
          skippedNote(deleteTargets, deletable, (count) =>
            translate(
              '{count} selected offering(s) are skipped: only draft offerings can be deleted.',
              { count },
            ),
          ),
          {
            run: (offering) =>
              marketplaceProviderOfferingsDestroy({
                path: { uuid: offering.uuid },
              }),
            successMessage: (count) =>
              translate('{count} offering(s) have been deleted.', { count }),
            failureMessage: (count) =>
              translate('Unable to delete {count} offering(s).', { count }),
          },
          {
            forDeletion: true,
            // The list does not load resource counts, so the backend decides.
            warning: translate(
              'An offering that still has resources is not deleted; any offering refused is reported with the reason.',
            ),
          },
        )
      }
    />
  );

  return (
    <ActionsMenu toggle="labeled" side="bottom">
      {stateActions.slice(0, 2).map(renderStateAction)}
      {pauseAction}
      {stateActions.slice(2).map(renderStateAction)}
      {groupAction}
      {moveAction}
      {exportAction}
      {deleteAction}
    </ActionsMenu>
  );
};
