import {
  CalendarIcon,
  DatabaseIcon,
  FoldersIcon,
  HardDrivesIcon,
  YoutubeLogoIcon,
  ImageIcon,
  UsersThreeIcon,
  CubeFocusIcon,
  LaptopIcon,
  TreeStructureIcon,
  FileTextIcon,
  SealQuestionIcon,
  MicrophoneIcon,
  AmbulanceIcon,
  CopyIcon,
  SignOutIcon,
} from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';

interface ReferralTypeIconProps {
  resourceType: string;
}

const Components = {
  Audiovisual: YoutubeLogoIcon,
  Collection: FoldersIcon,
  DataPaper: HardDrivesIcon,
  Dataset: DatabaseIcon,
  Event: CalendarIcon,
  Image: ImageIcon,
  InteractiveResource: UsersThreeIcon,
  Model: CopyIcon,
  PhysicalObject: CubeFocusIcon,
  Service: AmbulanceIcon,
  Software: LaptopIcon,
  Sound: MicrophoneIcon,
  Text: FileTextIcon,
  Workflow: TreeStructureIcon,
  Other: SignOutIcon,
  Default: SealQuestionIcon,
};

export const ReferralTypeIcon: FunctionComponent<ReferralTypeIconProps> = (
  props,
) => {
  /* Available values of resource type:
   * https://schema.datacite.org/meta/kernel-4.1/include/datacite-resourceType-v4.1.xsd
   */
  const Component = Components[props.resourceType] || Components.Default;
  return (
    <Tip label={props.resourceType} id="resource-type-label">
      <Component />
    </Tip>
  );
};
