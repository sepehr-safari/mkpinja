import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { ZapButton } from './ZapButton';
import type { NostrEvent } from '@nostrify/nostrify';

const mockEvent: NostrEvent = {
  id: 'test-event-id',
  pubkey: 'test-pubkey',
  created_at: Math.floor(Date.now() / 1000),
  kind: 30024,
  tags: [],
  content: 'Test bookmark content',
  sig: 'test-signature',
};

describe('ZapButton', () => {
  it('renders zap button', () => {
    render(
      <TestApp>
        <ZapButton event={mockEvent} />
      </TestApp>
    );

    const zapButton = screen.getByRole('button');
    expect(zapButton).toBeInTheDocument();
  });

  it('renders with label when showLabel is true', () => {
    render(
      <TestApp>
        <ZapButton event={mockEvent} showLabel={true} />
      </TestApp>
    );

    expect(screen.getByText('Zap')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <TestApp>
        <ZapButton event={mockEvent} className="custom-class" />
      </TestApp>
    );

    const zapButton = screen.getByRole('button');
    expect(zapButton).toHaveClass('custom-class');
  });
});