import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uniqueId } from 'lodash';
import { useCallback, useState } from 'react';
import {
  supportAttachmentsCreate,
  supportAttachmentsDestroy,
  supportAttachmentsList,
} from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { showError, showErrorResponse } from '@/store/notify';
import store from '@/store/store';

import { Attachment, IssueAttachmentUploading } from './types';
import { validateFiles, getErrorMessage } from './utils';

const sortAttachments = (attachments: Attachment[]) =>
  [...attachments].sort((a, b) => (a.created > b.created ? -1 : 1));

export const useIssueAttachments = (issueUrl: string) => {
  return useQuery({
    queryKey: ['issueAttachments', issueUrl],
    queryFn: async () => {
      const response = await supportAttachmentsList({
        query: { issue: issueUrl },
      });
      return sortAttachments(response.data as Attachment[]);
    },
    enabled: !!issueUrl,
  });
};

export const useUploadAttachments = (issueUrl: string) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<IssueAttachmentUploading[]>([]);

  const uploadFile = useCallback(
    async (key: string, file: File) => {
      try {
        const response = await supportAttachmentsCreate({
          body: { issue: issueUrl, file },
          ...formDataOptions,
        });
        // Remove from uploading list on success
        setUploading((prev) => prev.filter((item) => item.key !== key));
        // Invalidate the attachments query to refresh the list
        queryClient.invalidateQueries({
          queryKey: ['issueAttachments', issueUrl],
        });
        return response.data;
      } catch (error) {
        // Mark as error in uploading list
        setUploading((prev) =>
          prev.map((item) =>
            item.key === key ? { ...item, error, progress: 0 } : item,
          ),
        );
        store.dispatch(
          showErrorResponse(
            error as Response,
            translate('Unable to upload attachment.'),
          ),
        );
        throw error;
      }
    },
    [issueUrl, queryClient],
  );

  const upload = useCallback(
    async (files: File[]) => {
      const { accepted, rejected } = validateFiles(
        files,
        ENV.excludedAttachmentTypes,
      );

      if (rejected.length) {
        const message = getErrorMessage(rejected);
        store.dispatch(showError(message));
      }

      if (accepted.length === 0) {
        return;
      }

      // Add accepted files to uploading list with unique keys
      const newUploading: IssueAttachmentUploading[] = accepted.map((file) => ({
        key: uniqueId('attachment_'),
        file,
        progress: 0,
      }));
      setUploading((prev) => [...newUploading, ...prev]);

      // Upload files in parallel
      await Promise.allSettled(
        newUploading.map((item) => uploadFile(item.key, item.file)),
      );
    },
    [uploadFile],
  );

  const retry = useCallback(
    (key: string) => {
      const item = uploading.find((item) => item.key === key);
      if (!item) return;
      // Reset error state
      setUploading((prev) =>
        prev.map((i) =>
          i.key === key ? { ...i, error: null, progress: 0 } : i,
        ),
      );
      // Retry upload
      uploadFile(key, item.file);
    },
    [uploadFile, uploading],
  );

  const cancel = useCallback((key: string) => {
    setUploading((prev) => prev.filter((item) => item.key !== key));
  }, []);

  return {
    uploading,
    upload,
    retry,
    cancel,
  };
};

export const useDeleteAttachment = (issueUrl: string) => {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  const deleteMutation = useMutation({
    mutationFn: async (uuid: string) => {
      await supportAttachmentsDestroy({ path: { uuid } });
      return uuid;
    },
    onMutate: (uuid: string) => {
      // Track which item is being deleted to show loading state
      setDeleting((prev) => new Set(prev).add(uuid));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['issueAttachments', issueUrl],
      });
    },
    onError: (error: Response) => {
      store.dispatch(
        showErrorResponse(error, translate('Unable to delete attachment.')),
      );
    },
    onSettled: (_data, _error, uuid) => {
      // Clear deleting state
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(uuid);
        return next;
      });
    },
  });

  return {
    deleteAttachment: deleteMutation.mutate,
    isDeleting: (uuid: string) => deleting.has(uuid),
  };
};
