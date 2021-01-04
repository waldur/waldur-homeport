import { RootState } from '@waldur/store/reducers';

export const getAttachments = (state: RootState) =>
  state.issues.attachments.items;
export const getFilter = (state: RootState) => state.issues.attachments.filter;
export const getDeleting = (state: RootState) =>
  state.issues.attachments.deleting;
export const getIsDeleting = (state, { attachment }) =>
  !!state.issues.attachments.deleting[attachment.uuid];
export const getIsLoading = (state: RootState) =>
  state.issues.attachments.loading;
export const getUploading = (state: RootState) =>
  state.issues.attachments.uploading;
export const getExludedTypes = (state: RootState) =>
  state.config.excludedAttachmentTypes;
