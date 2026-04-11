import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CulqiPayment } from '../CulqiPayment';

// Mock Culqi SDK
const mockCulqi = {
  publicKey: '',
  settings: vi.fn(),
  createToken: vi.fn(),
  token: null,
  error: null,
};

describe('CulqiPayment Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const defaultProps = {
    amount: 100,
    email: 'test@example.com',
    orderNumber: 'ORD-123',
    onSuccess: mockOnSuccess,
    onError: mockOnError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).Culqi = mockCulqi;
  });

  it('renders payment form with all fields', () => {
    render(<CulqiPayment {...defaultProps} />);

    expect(screen.getByText('Pagar con Tarjeta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('AAAA')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument();
  });

  it('displays the correct amount', () => {
    render(<CulqiPayment {...defaultProps} />);
    expect(screen.getByText('S/ 100.00')).toBeInTheDocument();
  });

  it('shows test cards info in development mode', () => {
    vi.stubEnv('DEV', true);

    render(<CulqiPayment {...defaultProps} />);

    expect(screen.getByText('Tarjetas de Prueba:')).toBeInTheDocument();
    expect(screen.getByText(/Visa: 4111 1111 1111 1111/)).toBeInTheDocument();
    expect(screen.getByText(/Mastercard: 5111 1111 1111 1118/)).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it('shows pay button with correct text', () => {
    render(<CulqiPayment {...defaultProps} />);

    const payButton = screen.getByRole('button', { name: /Pagar S\/ 100.00/i });
    expect(payButton).toBeInTheDocument();
    expect(payButton).not.toBeDisabled();
  });

  it('shows security message', () => {
    render(<CulqiPayment {...defaultProps} />);

    expect(
      screen.getByText(/Tu información está protegida con encriptación de 256 bits/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Procesado de forma segura por Culqi/i)).toBeInTheDocument();
  });

  it('initializes Culqi with public key on mount', () => {
    render(<CulqiPayment {...defaultProps} />);

    expect((window as any).Culqi.publicKey).toBeTruthy();
  });

  it('prefills email from props', () => {
    render(<CulqiPayment {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com') as HTMLInputElement;
    expect(emailInput.value).toBe('test@example.com');
  });
});
