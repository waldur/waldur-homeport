import { FC } from 'react';
import { TechnicalAssessmentAnswer } from 'waldur-js-client';

import { FileLink, isFileUpload } from '@/project/metadata/ParsedAnswer';

/**
 * A step answer as its reader sees it: an attached file is a button that
 * downloads it (the media endpoint decides who may), anything else the
 * backend's text reading of the answer.
 */
export const StepAnswerValue: FC<{ answer: TechnicalAssessmentAnswer }> = ({
  answer,
}) => {
  const data: unknown = answer.answer_data;
  const files = (Array.isArray(data) ? data : [data]).filter(isFileUpload);
  if (files.length > 0) {
    return (
      <span className="flex flex-col items-start">
        {files.map((file) => (
          <FileLink key={file.stored_file_id} file={file} />
        ))}
      </span>
    );
  }
  return <>{answer.answer_display}</>;
};
