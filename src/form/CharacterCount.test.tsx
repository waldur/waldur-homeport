import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CharacterCount } from './CharacterCount';

describe('CharacterCount', () => {
  it('shows the count against the limit while under it', () => {
    render(<CharacterCount value="abc" max={10} />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('3 / 10');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('is still within the limit exactly at it', () => {
    render(<CharacterCount value={'a'.repeat(10)} max={10} />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('10 / 10');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('marks the count as over the limit', () => {
    render(<CharacterCount value={'a'.repeat(11)} max={10} />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('11 / 10');
    expect(count).toHaveAttribute('data-state', 'over');
  });

  it('does not flag an overrun the value arrived with', () => {
    render(<CharacterCount value={'a'.repeat(11)} max={10} pristine />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('11 / 10');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('flags the overrun once the value is edited', () => {
    render(<CharacterCount value={'a'.repeat(11)} max={10} pristine={false} />);
    expect(screen.getByTestId('character-count')).toHaveAttribute(
      'data-state',
      'over',
    );
  });

  it('shows only the count without a limit', () => {
    render(<CharacterCount value="hello" />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('5 characters');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('counts code points as the backend does, not UTF-16 units', () => {
    render(<CharacterCount value={'ab' + '\u{1F600}'} max={3} />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('3 / 3');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('counts an empty value as zero', () => {
    render(<CharacterCount value={undefined} max={10} />);
    expect(screen.getByTestId('character-count')).toHaveTextContent('0 / 10');
  });
});
