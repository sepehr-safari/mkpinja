import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { UserDisplay } from './UserDisplay';

describe('UserDisplay', () => {
  const testPubkey = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  it('renders with generated username when no metadata is available', () => {
    render(
      <TestApp>
        <UserDisplay pubkey={testPubkey} />
      </TestApp>
    );

    // Should show a generated username (will be consistent due to deterministic generation)
    expect(screen.getByText(/\w+ \w+/)).toBeInTheDocument();
  });

  it('renders with different avatar sizes', () => {
    const { container } = render(
      <TestApp>
        <UserDisplay pubkey={testPubkey} avatarSize="lg" />
      </TestApp>
    );

    // Avatar should be present with lg size class
    const avatar = container.querySelector('.h-10.w-10');
    expect(avatar).toBeInTheDocument();
  });

  it('shows full pubkey when requested', () => {
    render(
      <TestApp>
        <UserDisplay pubkey={testPubkey} showFullPubkey={true} />
      </TestApp>
    );

    // Should show the full pubkey
    expect(screen.getByText(testPubkey)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TestApp>
        <UserDisplay pubkey={testPubkey} className="custom-class" />
      </TestApp>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});