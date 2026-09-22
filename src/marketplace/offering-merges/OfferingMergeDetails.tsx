import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useEffect, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { OfferingMergeRefusal } from 'waldur-js-client';

import { BaseButton } from '@/core/buttons/BaseButton';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { renderFieldOrDash } from '@/table/utils';

import { UndoMergeButton } from './actions';
import { LIST_STATE, WIZARD_STATE } from './constants';
import {
  useCanManageMerges,
  useMergeOfferings,
  useOfferingMerge,
} from './hooks';
import { getPlanNames, MergeMappingsView } from './MergeMappingsView';
import { MergePreviewView } from './MergePreviewView';
import { MergeRefusalAlert } from './MergeRefusal';
import { MergeProgress, MergeVerification } from './MergeRunStatus';
import { OfferingMergeStateBadge } from './OfferingMergeStateBadge';
import { isEditable } from './utils';

export const OfferingMergeDetails: FC = () => {
  const { params } = useCurrentStateAndParams();
  const router = useRouter();
  const canManage = useCanManageMerges();
  const {
    data: merge,
    isLoading,
    error,
    refetch,
  } = useOfferingMerge(params.merge_uuid);
  const offeringUuids = useMemo(
    () => (merge ? [...merge.sources, merge.target] : []),
    [merge],
  );
  const { data: offerings } = useMergeOfferings(offeringUuids);
  const [refusal, setRefusal] = useState<OfferingMergeRefusal | null>(null);
  const mergeState = merge?.state;
  useEffect(() => setRefusal(null), [mergeState]);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <LoadingErred loadData={refetch} />;
  }
  if (!merge) {
    return (
      <NoResult
        title={translate('Merge not found')}
        message={translate('The merge may have been deleted.')}
        buttonTitle={translate('Back to offering merges')}
        callback={() => router.stateService.go(LIST_STATE)}
      />
    );
  }

  return (
    <div className="d-flex flex-column gap-5">
      <Card>
        <Card.Body className="d-flex flex-column gap-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <h2 className="mb-1">
                {translate('Merge into {target}', {
                  target: merge.target_offering?.name,
                })}
              </h2>
              <OfferingMergeStateBadge state={merge.state} />
            </div>
            <div className="d-flex gap-3">
              {canManage && isEditable(merge.state) && (
                <BaseButton
                  label={translate('Continue in wizard')}
                  variant="tertiary"
                  iconNode={<PencilSimpleIcon weight="bold" />}
                  onClick={() =>
                    router.stateService.go(WIZARD_STATE, {
                      merge: merge.uuid,
                    })
                  }
                />
              )}
              <UndoMergeButton merge={merge} onRefused={setRefusal} />
            </div>
          </div>
          <FormTable>
            <FormTable.Item
              label={translate('Sources')}
              value={
                <div className="d-flex flex-column">
                  {merge.source_offerings.map((offering) => (
                    <Link
                      key={offering.uuid}
                      state="admin-marketplace-offering-details"
                      params={{ offering_uuid: offering.uuid }}
                    >
                      {offering.name}
                    </Link>
                  ))}
                </div>
              }
            />
            <FormTable.Item
              label={translate('Target')}
              value={
                <Link
                  state="admin-marketplace-offering-details"
                  params={{ offering_uuid: merge.target }}
                >
                  {merge.target_offering?.name}
                </Link>
              }
            />
            <FormTable.Item
              label={translate('Created')}
              value={formatDateTime(merge.created)}
            />
            <FormTable.Item
              label={translate('Created by')}
              value={renderFieldOrDash(merge.created_by_full_name)}
            />
          </FormTable>
          <MergeRefusalAlert
            title={translate('Undo was refused')}
            refusal={refusal}
          />
          <MergeProgress merge={merge} />
        </Card.Body>
      </Card>

      <MergeVerification merge={merge} />

      <Card>
        <Card.Header>
          <Card.Title>{translate('Mappings')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <MergeMappingsView merge={merge} offerings={offerings} />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>{translate('Preview')}</Card.Title>
        </Card.Header>
        <Card.Body>
          {merge.preview ? (
            <MergePreviewView
              preview={merge.preview}
              planNames={getPlanNames(offerings)}
              tableId={`OfferingMergeDetails-${merge.uuid}`}
            />
          ) : (
            <p className="text-muted mb-0">
              {translate(
                'No stored preview. It is computed in the wizard and discarded when a mapping changes.',
              )}
            </p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
