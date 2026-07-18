import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceProviderOfferingsAccessSubnetsRetrieve } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { saveFile } from '@/table/exporters/saveFile';

interface OfferingAccessSubnetsAllowListDialogProps {
  resolve: {
    offeringUuid: string;
  };
}

export const OfferingAccessSubnetsAllowListDialog = ({
  resolve: { offeringUuid },
}: OfferingAccessSubnetsAllowListDialogProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['OfferingAccessSubnets', offeringUuid],
    queryFn: () =>
      marketplaceProviderOfferingsAccessSubnetsRetrieve({
        path: { uuid: offeringUuid },
      }).then((response) => response.data),
    // Always fetch fresh when the dialog opens: the aggregation is not
    // invalidated when individual subnets change, so a stale cache would
    // otherwise omit recently added entries.
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const packed = data?.packed ?? [];
  const packedText = packed.join('\n');
  const download = () =>
    saveFile(
      new Blob([packedText + '\n'], { type: 'text/plain' }),
      `access-subnets-${offeringUuid}.txt`,
    );

  return (
    <ModalDialog
      title={translate('Firewall allow-list')}
      footer={
        !isLoading && (
          <>
            <CopyToClipboardButton
              value={packedText}
              verbose={translate('Allow-list')}
            />
            <SubmitButton
              submitting={false}
              type="button"
              variant="tertiary"
              onClick={download}
              label={translate('Download')}
              iconNode={<DownloadSimpleIcon weight="bold" />}
              iconOnLeft
            />
          </>
        )
      }
    >
      <p className="text-muted">
        {translate(
          'Minimal set of CIDRs covering all access subnets of this offering (per-resource subnets merged with the provider defaults), ready to feed an external firewall allow-list.',
        )}
      </p>
      {isLoading ? (
        <LoadingSpinner />
      ) : packed.length === 0 ? (
        <p className="mb-0">{translate('No access subnets found.')}</p>
      ) : (
        <pre className="mb-0">{packedText}</pre>
      )}
    </ModalDialog>
  );
};
