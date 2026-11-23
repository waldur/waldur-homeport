import { FileSvgIcon, ImageIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import { downloadPng, downloadSvg } from './exportSvg';

/** Download buttons for a drawing: the SVG as drawn, or a PNG of it. */
export const ExportButtons: FC<{
  getSvg: () => SVGSVGElement | null;
  name: string;
}> = ({ getSvg, name }) => {
  const { showError } = useNotify();
  return (
    <>
      <BaseButton
        variant="tertiary"
        size="lg"
        label={translate('SVG')}
        iconNode={<FileSvgIcon weight="bold" />}
        onClick={() => {
          const svg = getSvg();
          if (svg) downloadSvg(svg, name);
        }}
      />
      <BaseButton
        variant="tertiary"
        size="lg"
        label={translate('PNG')}
        iconNode={<ImageIcon weight="bold" />}
        onClick={() => {
          const svg = getSvg();
          if (svg) {
            downloadPng(svg, name).catch((error) => showError(error.message));
          }
        }}
      />
    </>
  );
};
