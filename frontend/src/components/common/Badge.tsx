import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Specific badge components
export const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0) {
    return <Badge variant="error">Sin stock</Badge>;
  }
  if (stock < 10) {
    return <Badge variant="warning">Stock bajo: {stock}</Badge>;
  }
  return <Badge variant="success">En stock: {stock}</Badge>;
};

export const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pendiente' },
    PROCESSING: { variant: 'info', label: 'Procesando' },
    PAID: { variant: 'success', label: 'Pagado' },
    COMPLETED: { variant: 'success', label: 'Completado' },
    CANCELLED: { variant: 'error', label: 'Cancelado' },
    SHIPPED: { variant: 'purple', label: 'Enviado' },
    DELIVERED: { variant: 'success', label: 'Entregado' },
  };

  const config = statusMap[status] || { variant: 'default', label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const DiscountBadge = ({ percentage }: { percentage: number }) => {
  return (
    <Badge variant="error" className="animate-pulse">
      -{percentage}%
    </Badge>
  );
};

export const NewBadge = () => {
  return (
    <Badge variant="purple" className="animate-pulse">
      NUEVO
    </Badge>
  );
};

export const FeaturedBadge = () => {
  return (
    <Badge variant="warning">
      ⭐ DESTACADO
    </Badge>
  );
};
