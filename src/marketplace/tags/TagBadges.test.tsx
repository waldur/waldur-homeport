import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TagBadges } from './TagBadges';

const tags = [
  { uuid: '1', name: 'Tag A', url: '' },
  { uuid: '2', name: 'Tag B', url: '' },
  { uuid: '3', name: 'Tag C', url: '' },
  { uuid: '4', name: 'Tag D', url: '' },
  { uuid: '5', name: 'Tag E', url: '' },
];

describe('TagBadges', () => {
  it('renders nothing when tags are empty', () => {
    const { container } = render(<TagBadges tags={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when tags are undefined', () => {
    const { container } = render(<TagBadges />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all tags when no maxTags is set', () => {
    render(<TagBadges tags={tags} />);
    tags.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument();
    });
  });

  it('truncates tags when maxTags is set', () => {
    render(<TagBadges tags={tags} maxTags={2} />);
    expect(screen.getByText('Tag A')).toBeInTheDocument();
    expect(screen.getByText('Tag B')).toBeInTheDocument();
    expect(screen.queryByText('Tag C')).not.toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('does not truncate when tags count equals maxTags', () => {
    render(<TagBadges tags={tags.slice(0, 3)} maxTags={3} />);
    expect(screen.getByText('Tag A')).toBeInTheDocument();
    expect(screen.getByText('Tag B')).toBeInTheDocument();
    expect(screen.getByText('Tag C')).toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });

  it('calls onTagClick when a tag is clicked', async () => {
    const user = userEvent.setup();
    const onTagClick = vi.fn();
    render(<TagBadges tags={tags.slice(0, 2)} onTagClick={onTagClick} />);

    await user.click(screen.getByText('Tag A'));
    expect(onTagClick).toHaveBeenCalledWith(tags[0]);
  });

  it('adds cursor-pointer class when onTagClick is provided', () => {
    render(<TagBadges tags={tags.slice(0, 1)} onTagClick={() => undefined} />);
    const tagEl = screen.getByText('Tag A');
    expect(tagEl.closest('.tag')).toHaveClass('cursor-pointer');
  });

  it('does not add cursor-pointer class when onTagClick is not provided', () => {
    render(<TagBadges tags={tags.slice(0, 1)} />);
    const tagEl = screen.getByText('Tag A');
    expect(tagEl.closest('.tag')).not.toHaveClass('cursor-pointer');
  });
});
