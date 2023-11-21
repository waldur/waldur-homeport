import { Link } from '@waldur/core/Link';

import { scrollToSectionById } from '../offerings/utils';

interface PageBarTabProps {
  title: any;
  name: string;
  state: string;
  params?: any;
  active?: boolean;
  className?: string;
}

export const PageBarTab = (props: PageBarTabProps) => (
  <Link
    state={props.state}
    params={props.params}
    className={
      props.className ||
      'btn text-hover-primary' + (props.active ? ' text-primary' : '')
    }
    onClick={() => scrollToSectionById(props.name)}
  >
    {props.title}
  </Link>
);
