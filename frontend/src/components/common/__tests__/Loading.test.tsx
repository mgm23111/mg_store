import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from '../Loading';

describe('Loading Component', () => {
  it('renders loading spinner', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders default (non-fullscreen) loading', () => {
    const { container } = render(<Loading />);
    const wrapper = container.querySelector('.flex.items-center.justify-center.p-8');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders fullscreen loading when fullScreen prop is true', () => {
    const { container } = render(<Loading fullScreen />);
    const fullScreenWrapper = container.querySelector('.fixed.inset-0');
    expect(fullScreenWrapper).toBeInTheDocument();
  });

  it('shows "Cargando..." text in fullscreen mode', () => {
    render(<Loading fullScreen />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('does not show text in non-fullscreen mode', () => {
    render(<Loading />);
    expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
  });

  it('applies correct z-index in fullscreen mode', () => {
    const { container } = render(<Loading fullScreen />);
    const fullScreenWrapper = container.querySelector('.z-50');
    expect(fullScreenWrapper).toBeInTheDocument();
  });

  it('has larger spinner in fullscreen mode', () => {
    const { container } = render(<Loading fullScreen />);
    const spinner = container.querySelector('.h-16.w-16');
    expect(spinner).toBeInTheDocument();
  });

  it('has smaller spinner in normal mode', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.h-12.w-12');
    expect(spinner).toBeInTheDocument();
  });

  it('applies semi-transparent background in fullscreen mode', () => {
    const { container } = render(<Loading fullScreen />);
    const wrapper = container.querySelector('.bg-opacity-90');
    expect(wrapper).toBeInTheDocument();
  });

  it('applies blue color to spinner', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.border-blue-600');
    expect(spinner).toBeInTheDocument();
  });
});
