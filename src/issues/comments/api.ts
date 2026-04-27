import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Issue,
  supportCommentsDestroy,
  supportCommentsList,
  supportCommentsUpdate,
  supportIssuesComment,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { showErrorResponse } from '@/store/notify';
import store from '@/store/store';

import { Comment } from './types';

const sortComments = (comments: Comment[]) =>
  [...comments].sort((a, b) => Date.parse(b.created) - Date.parse(a.created));

export const useIssueComments = (issueUrl: string) => {
  return useQuery({
    queryKey: ['issueComments', issueUrl],
    queryFn: async () => {
      const response = await supportCommentsList({
        query: { issue: issueUrl },
      });
      return sortComments(response.data as Comment[]);
    },
    enabled: !!issueUrl,
  });
};

export const useCreateComment = (issue: Issue) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (description: string) => {
      const response = await supportIssuesComment({
        path: { uuid: issue.uuid },
        body: {
          is_public: true,
          description,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueComments', issue.url] });
    },
    onError: (error: Response) => {
      store.dispatch(
        showErrorResponse(error, translate('Unable to post comment.')),
      );
    },
  });
};

export const useUpdateComment = (issueUrl: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      description,
    }: {
      commentId: string;
      description: string;
    }) => {
      const response = await supportCommentsUpdate({
        path: { uuid: commentId },
        body: {
          is_public: true,
          description,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueComments', issueUrl] });
    },
    onError: (error: Response) => {
      store.dispatch(
        showErrorResponse(error, translate('Unable to edit comment.')),
      );
    },
  });
};

export const useDeleteComment = (issueUrl: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await supportCommentsDestroy({ path: { uuid: commentId } });
      return commentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueComments', issueUrl] });
    },
    onError: (error: Response) => {
      store.dispatch(
        showErrorResponse(error, translate('Unable to delete comment.')),
      );
    },
  });
};
