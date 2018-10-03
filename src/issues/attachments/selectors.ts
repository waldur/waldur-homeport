export const getAttachments = state => state.issues.attachments.items;
export const getFilter = state => state.issues.attachments.filter;
export const getDeleting = state => state.issues.attachments.deleting;
export const getIsDeleting = (state, { attachment }) => !!state.issues.attachments.deleting[attachment.uuid];
export const getIsLoading = state => state.issues.attachments.loading;
export const getUploading = state => state.issues.attachments.uploading;
export const getExludedTypes = state => state.config.excludedAttachmentTypes;
