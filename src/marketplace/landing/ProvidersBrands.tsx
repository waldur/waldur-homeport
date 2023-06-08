import { Stack } from 'react-bootstrap';

import { Image } from '@waldur/core/Image';

import { isExperimentalUiComponentsVisible } from '../utils';

const akki = require('./images/akki.png');
const lumi = require('./images/lumi.png');
const taltech = require('./images/taltech.png');
const telia = require('./images/telia.png');
const uniOfTartu = require('./images/uni-of-tartu.png');

export const ProvidersBrands = () => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return showExperimentalUiComponents ? (
    <Stack
      gap={5}
      direction="horizontal"
      className="providers-brands mw-100 overflow-auto justify-content-between px-md-10 mb-10"
    >
      <Image src={lumi} size={75} classes="symbol-2by3" />
      <Image src={uniOfTartu} size={100} classes="symbol-2by3" />
      <Image src={taltech} size={50} classes="symbol-2by3" />
      <Image src={telia} size={100} classes="symbol-2by3" />
      <Image src={akki} size={75} classes="symbol-2by3" />
    </Stack>
  ) : null;
};
