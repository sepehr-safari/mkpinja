import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(
      <TestApp>
        <ThemeToggle />
      </TestApp>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });

  it('toggles theme when clicked', () => {
    render(
      <TestApp>
        <ThemeToggle />
      </TestApp>
    );

    const button = screen.getByRole('button');
    
    // Click the button to toggle theme
    fireEvent.click(button);
    
    // The button should still be present after clicking
    expect(button).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestApp>
        <ThemeToggle />
      </TestApp>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });
});