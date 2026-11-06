import { useDispatch } from 'react-redux';
import {
  marketplaceProviderOfferingsRetrieve,
  ProviderOfferingDetailsFieldEnum,
} from 'waldur-js-client';

import { show } from 'waldur-notifications';

import { format } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { resetSelection, selectRow } from '@/table/actions';

import {
  BulkOffering,
  OfferingBatchResult,
  OfferingFailure,
  runOfferingBatch,
} from './bulkOfferingActions';

/** How many failures the toast names before summarising the rest. */
const LISTED_FAILURES = 5;

/** The fields the bulk menu decides on; see BulkOffering. */
const SELECTION_FIELDS: ProviderOfferingDetailsFieldEnum[] = [
  'uuid',
  'name',
  'state',
  'customer_uuid',
  'plans',
  'type',
];

/**
 * The offering as it is now. A request that failed often did so because the
 * offering changed since the page loaded it (another user paused it, say), and
 * the selection must show the new state, or the menu would offer the wrong
 * actions for it. Falls back to the listed row if the offering cannot be read.
 */
const reloadOffering = async <T extends BulkOffering>(offering: T) => {
  try {
    const response = await marketplaceProviderOfferingsRetrieve({
      path: { uuid: offering.uuid },
      query: { field: SELECTION_FIELDS },
    });
    return response?.data ? { ...offering, ...response.data } : offering;
  } catch {
    return offering;
  }
};

export interface OfferingBatchJob<T extends BulkOffering = BulkOffering> {
  offerings: T[];
  run(offering: T): Promise<unknown>;
  /** Shown when at least one offering succeeded; receives how many. */
  successMessage(count: number): string;
  /** Title of the error toast; receives how many offerings failed. */
  failureMessage(count: number): string;
  /**
   * Shown when the batch itself breaks (building a download, say), not one
   * offering's request. Defaults to a generic message.
   */
  errorMessage?: string;
  /** Runs after the batch, before the list refetches (e.g. saving a file). */
  onDone?(
    result: OfferingBatchResult<T> & { values: Map<T, unknown> },
  ): void | Promise<void>;
}

const OfferingFailureList = ({ failed }: { failed: OfferingFailure[] }) => {
  const listed = failed.slice(0, LISTED_FAILURES);
  const rest = failed.length - listed.length;
  return (
    <ul className="m-0 ps-4 list-disc">
      {listed.map(({ offering, error }) => (
        <li key={offering.uuid}>
          <span className="font-medium">{offering.name}</span>: {format(error)}
        </li>
      ))}
      {rest > 0 && <li>{translate('…and {count} more.', { count: rest })}</li>}
    </ul>
  );
};

/**
 * Runs one request per selected offering and reports the outcome: how many
 * succeeded, and which ones failed with the backend's reason. The list
 * refetches either way, and the offerings that failed stay selected, so the
 * user can fix them and retry without picking them out again.
 */
export const useOfferingBatch = ({
  table,
  refetch,
  closeModal = false,
}: {
  table: string;
  refetch(): void;
  closeModal?: boolean;
}) => {
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();

  const mutation = useManagedMutation<
    OfferingBatchResult & { values: Map<BulkOffering, unknown> },
    unknown,
    OfferingBatchJob<any>
  >({
    mutationFn: async (job) => {
      const result = await runOfferingBatch(job.offerings, job.run);
      await job.onDone?.(result);
      // Read the failed offerings again now, while they are still selected,
      // through the same request pool as the batch itself.
      const reloaded = await runOfferingBatch(
        result.failed.map(({ offering }) => offering),
        reloadOffering,
      );
      const failed = result.failed.map((failure) => ({
        ...failure,
        offering: reloaded.values.get(failure.offering) ?? failure.offering,
      }));
      return { ...result, failed };
    },
    refetch,
    closeModal,
    onSuccess: (result, job) => {
      if (result.succeeded.length) {
        showSuccess(job.successMessage(result.succeeded.length));
      }
      if (result.failed.length) {
        show(
          'error',
          job.failureMessage(result.failed.length),
          <OfferingFailureList failed={result.failed} />,
        );
        // Select exactly the failed offerings, as they are now.
        dispatch(resetSelection(table));
        result.failed.forEach(({ offering }) =>
          dispatch(selectRow(table, offering)),
        );
      }
    },
    onError: (error, job) => {
      showErrorResponse(
        error,
        job?.errorMessage ??
          translate('The bulk action could not be completed.'),
      );
      // Some requests may have gone through before the batch broke.
      refetch();
    },
  });

  /**
   * Runs a job from a form's submit handler. Every outcome, a broken batch
   * included, has been reported by the time it resolves, so it never rejects.
   */
  const submit = (job: OfferingBatchJob<any>) =>
    mutation.mutateAsync(job).then(
      () => undefined,
      () => undefined,
    );

  return { ...mutation, submit };
};

/** What a bulk dialog is opened with. */
export interface BulkOfferingsDialogResolve<
  T extends BulkOffering = BulkOffering,
> {
  /** The offerings the dialog acts on, already narrowed from the selection. */
  offerings: T[];
  /** Why some selected offerings are left out, if any are. */
  skippedNote?: string;
  table: string;
  refetch(): void;
}
