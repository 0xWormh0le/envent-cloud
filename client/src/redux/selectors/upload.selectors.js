import { createSelector } from 'reselect';

export const getUploadState = state => state.upload;

export const getUploadProcessing = createSelector(
  getUploadState,
  upload => upload.processing,
);

export const getUploadProcessed = createSelector(
  getUploadState,
  upload => upload.processed,
);

export const getUploadError = createSelector(getUploadState, upload => upload.error);

export const getUpload = createSelector(
  getUploadState,
  upload => upload.upload,
);
