import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SafeMarkdown } from './SafeMarkdown';

describe('SafeMarkdown', () => {
  describe('safe content', () => {
    it('renders plain text', () => {
      render(<SafeMarkdown text="Hello world" />);
      expect(screen.getByText('Hello world')).toBeTruthy();
    });

    it('keeps https links with the correct href', () => {
      render(
        <SafeMarkdown text="[Support](https://support.example.com/ticket/123)" />,
      );
      const link = screen.getByRole('link', { name: 'Support' });
      expect(link.getAttribute('href')).toBe(
        'https://support.example.com/ticket/123',
      );
    });

    it('renders bold and italic text', () => {
      render(<SafeMarkdown text="**bold** and _italic_" />);
      expect(document.querySelector('strong')?.textContent).toBe('bold');
      expect(document.querySelector('em')?.textContent).toBe('italic');
    });

    it('renders unordered lists', () => {
      render(<SafeMarkdown text={'- item one\n- item two'} />);
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(2);
    });
  });

  describe('XSS prevention — javascript: URLs', () => {
    it('strips javascript: href from a markdown link', () => {
      render(<SafeMarkdown text="[Click me](javascript:alert('xss'))" />);
      const link = screen.queryByRole('link', { name: 'Click me' });
      // DOMPurify either removes the href attribute or the element entirely.
      if (link) {
        const href = link.getAttribute('href') ?? '';
        expect(href.toLowerCase()).not.toContain('javascript:');
      }
    });

    it('strips HTML-entity-encoded javascript: href', () => {
      render(<SafeMarkdown text="[Click me](javascript&#x3a;alert('xss'))" />);
      const link = screen.queryByRole('link', { name: 'Click me' });
      if (link) {
        const href = link.getAttribute('href') ?? '';
        expect(href.toLowerCase()).not.toContain('javascript:');
      }
    });

    it('strips percent-encoded javascript: href', () => {
      render(<SafeMarkdown text="[Click me](java%73cript:alert('xss'))" />);
      const link = screen.queryByRole('link', { name: 'Click me' });
      if (link) {
        const href = link.getAttribute('href') ?? '';
        expect(href.toLowerCase()).not.toContain('javascript:');
      }
    });
  });

  describe('XSS prevention — inline HTML', () => {
    it('strips <script> tags', () => {
      render(<SafeMarkdown text='<script>alert("xss")</script>safe text' />);
      expect(document.querySelector('script')).toBeNull();
      expect(screen.getByText('safe text')).toBeTruthy();
    });

    it('strips onerror event attributes', () => {
      render(<SafeMarkdown text='<img src=x onerror="alert(1)" />' />);
      const img = document.querySelector('img');
      // img may or may not appear depending on DOMPurify config, but
      // the onerror attribute must never survive.
      if (img) {
        expect(img.getAttribute('onerror')).toBeNull();
      }
    });

    it('strips data: URIs in img src', () => {
      render(
        <SafeMarkdown text='<img src="data:text/html,<script>alert(1)</script>" />' />,
      );
      const img = document.querySelector('img');
      if (img) {
        const src = img.getAttribute('src') ?? '';
        expect(src.toLowerCase()).not.toContain('data:');
      }
    });
  });

  describe('className prop', () => {
    it('has md-content class by default', () => {
      const { container } = render(<SafeMarkdown text="hi" />);
      expect(container.firstElementChild?.className).toContain('md-content');
      expect(container.firstElementChild?.className).not.toContain('undefined');
    });

    it('adds md-small-titles when smallTitles is true', () => {
      const { container } = render(<SafeMarkdown text="hi" smallTitles />);
      expect(container.firstElementChild?.className).toContain(
        'md-small-titles',
      );
    });

    it('does not add md-small-titles when smallTitles is false', () => {
      const { container } = render(
        <SafeMarkdown text="hi" smallTitles={false} />,
      );
      expect(container.firstElementChild?.className).not.toContain(
        'md-small-titles',
      );
    });
  });
});
