import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && <div className="mb-4 text-6xl opacity-50">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Predefined empty states
export const EmptyCart = ({ onShop }: { onShop: () => void }) => (
  <EmptyState
    icon="🛒"
    title="Tu carrito está vacío"
    description="Agrega productos a tu carrito para continuar con la compra"
    action={{
      label: 'Ir a comprar',
      onClick: onShop,
    }}
  />
);

export const EmptySearch = ({ onClear }: { onClear: () => void }) => (
  <EmptyState
    icon="🔍"
    title="No se encontraron resultados"
    description="Intenta con otros términos de búsqueda o filtros diferentes"
    action={{
      label: 'Limpiar filtros',
      onClick: onClear,
    }}
  />
);

export const EmptyProducts = ({ onCreate }: { onCreate: () => void }) => (
  <EmptyState
    icon="📦"
    title="No hay productos"
    description="Comienza creando tu primer producto para tu tienda"
    action={{
      label: 'Crear producto',
      onClick: onCreate,
    }}
  />
);

export const EmptyOrders = () => (
  <EmptyState
    icon="📋"
    title="No tienes pedidos"
    description="Tus pedidos aparecerán aquí una vez que realices una compra"
  />
);
