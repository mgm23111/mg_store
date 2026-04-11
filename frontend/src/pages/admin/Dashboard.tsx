import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../api/orderService';
import { productService } from '../../api/productService';
import { Order } from '../../types';
import { Loading } from '../../components/common/Loading';
import { useUIStore } from '../../stores/uiStore';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useUIStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch products and orders in parallel
        const [products, orders] = await Promise.all([
          productService.getAll(),
          orderService.getAll(),
        ]);

        // Calculate stats
        const pendingOrders = orders.filter(
          (o) => o.paymentStatus === 'PENDING'
        ).length;

        const totalRevenue = orders
          .filter((o) => o.paymentStatus === 'COMPLETED')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders,
          totalRevenue,
        });

        // Get recent orders (last 5)
        const sorted = [...orders].sort((a, b) => b.id - a.id);
        setRecentOrders(sorted.slice(0, 5));
      } catch (error) {
        addToast('error', 'Error al cargar datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addToast]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Productos"
          value={stats.totalProducts}
          icon="📦"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Órdenes"
          value={stats.totalOrders}
          icon="🛒"
          color="bg-green-500"
        />
        <StatCard
          title="Pagos Pendientes"
          value={stats.pendingOrders}
          icon="⏳"
          color="bg-yellow-500"
        />
        <StatCard
          title="Ingresos Totales"
          value={`S/ ${stats.totalRevenue.toFixed(2)}`}
          icon="💰"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Órdenes Recientes</h2>
          <Link
            to="/admin/orders"
            className="text-purple-600 hover:underline text-sm"
          >
            Ver todas
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay órdenes registradas
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Estado Pago</th>
                  <th className="text-left py-3 px-4">Método</th>
                  <th className="text-left py-3 px-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4">{order.customerName}</td>
                    <td className="py-3 px-4 font-semibold">
                      S/ {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="py-3 px-4">{order.paymentMethod}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          to="/admin/products"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">📦</div>
          <h3 className="font-semibold text-lg mb-2">Gestionar Productos</h3>
          <p className="text-gray-600 text-sm">
            Agregar, editar o eliminar productos del catálogo
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">🛒</div>
          <h3 className="font-semibold text-lg mb-2">Ver Órdenes</h3>
          <p className="text-gray-600 text-sm">
            Revisar y gestionar todas las órdenes
          </p>
        </Link>

        <Link
          to="/admin/yape"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-3xl mb-3">💳</div>
          <h3 className="font-semibold text-lg mb-2">Consola Yape</h3>
          <p className="text-gray-600 text-sm">
            Aprobar o rechazar pagos pendientes por Yape
          </p>
        </Link>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`${color} text-white text-3xl w-14 h-14 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'COMPLETED':
        return { text: 'Completado', bg: 'bg-green-100', color: 'text-green-800' };
      case 'PENDING':
        return { text: 'Pendiente', bg: 'bg-yellow-100', color: 'text-yellow-800' };
      case 'FAILED':
        return { text: 'Fallido', bg: 'bg-red-100', color: 'text-red-800' };
      case 'REFUNDED':
        return { text: 'Reembolsado', bg: 'bg-blue-100', color: 'text-blue-800' };
      default:
        return { text: status, bg: 'bg-gray-100', color: 'text-gray-800' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`${config.bg} ${config.color} px-3 py-1 rounded-full text-xs font-semibold`}>
      {config.text}
    </span>
  );
};
