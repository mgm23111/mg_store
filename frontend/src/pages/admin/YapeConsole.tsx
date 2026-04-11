import { useEffect, useState } from 'react';
import { paymentService } from '../../api/paymentService';
import { Payment } from '../../types';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { useUIStore } from '../../stores/uiStore';

export const AdminYapeConsole = () => {
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const { addToast } = useUIStore();

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      // Get pending Yape payments from the dedicated endpoint
      const payments = await paymentService.getPendingYapePayments();
      setPendingPayments(payments);
    } catch (error) {
      addToast('error', 'Error al cargar pagos pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handleApprove = async (paymentId: number, operationNumber?: string) => {
    if (!operationNumber) {
      const input = prompt('Ingresa el número de operación Yape:');
      if (!input) return;
      operationNumber = input;
    }

    try {
      setProcessing(paymentId);
      await paymentService.approveYapePayment(paymentId, 1, operationNumber); // 1 es adminId temporal
      addToast('success', 'Pago aprobado correctamente');
      fetchPendingPayments();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al aprobar pago';
      addToast('error', errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (paymentId: number) => {
    const reason = prompt('Ingresa el motivo del rechazo (opcional):');

    if (!confirm('¿Estás seguro de rechazar este pago?')) return;

    try {
      setProcessing(paymentId);
      await paymentService.rejectYapePayment(paymentId, 1, reason || 'No especificado'); // 1 es adminId temporal
      addToast('success', 'Pago rechazado');
      fetchPendingPayments();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al rechazar pago';
      addToast('error', errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Consola Yape</h1>
          <p className="text-gray-600 mt-2">
            Aprobar o rechazar pagos pendientes por Yape
          </p>
        </div>
        <Button onClick={fetchPendingPayments} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Cómo usar la Consola Yape:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Revisa los pagos pendientes en la tabla</li>
              <li>Verifica el comprobante de pago Yape del cliente</li>
              <li>Confirma el número de operación con tu app Yape</li>
              <li>Aprueba o rechaza el pago según corresponda</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Pagos Pendientes</p>
              <p className="text-3xl font-bold">{pendingPayments?.length || 0}</p>
            </div>
            <div className="bg-yellow-500 text-white text-3xl w-14 h-14 rounded-lg flex items-center justify-center">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Monto Total Pendiente</p>
              <p className="text-2xl font-bold">
                S/ {(pendingPayments || []).reduce((sum, p) => sum + (p.order?.totalAmount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-500 text-white text-3xl w-14 h-14 rounded-lg flex items-center justify-center">
              💰
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Requiere Atención</p>
              <p className="text-3xl font-bold text-orange-600">
                {(pendingPayments || []).filter(p =>
                  p.order && new Date().getTime() - new Date(p.order.createdAt).getTime() > 3600000
                ).length}
              </p>
            </div>
            <div className="bg-orange-500 text-white text-3xl w-14 h-14 rounded-lg flex items-center justify-center">
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!pendingPayments || pendingPayments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500 text-lg">No hay pagos pendientes</p>
            <p className="text-gray-400 text-sm mt-2">
              Todos los pagos por Yape han sido procesados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">ID Orden</th>
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Teléfono</th>
                  <th className="text-left py-3 px-4">Monto</th>
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Tiempo Espera</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(pendingPayments || []).map((payment) => {
                  const waitTime = Math.floor(
                    (new Date().getTime() - new Date(payment.order?.createdAt || payment.createdAt).getTime()) / 60000
                  );
                  const isUrgent = waitTime > 60; // More than 1 hour

                  return (
                    <tr
                      key={payment.id}
                      className={`border-b hover:bg-gray-50 ${
                        isUrgent ? 'bg-orange-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-sm">
                        #{payment.order?.id || payment.id}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {payment.order?.customerName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {payment.order?.customerEmail || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {payment.order?.customerPhone ? (
                          <a
                            href={`https://wa.me/${payment.order.customerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            {payment.order.customerPhone}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-lg">
                        S/ {(payment.order?.totalAmount || payment.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(payment.order?.createdAt || payment.createdAt).toLocaleString('es-PE')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isUrgent
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {waitTime < 60
                            ? `${waitTime} min`
                            : `${Math.floor(waitTime / 60)}h ${waitTime % 60}m`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(payment.id)}
                            disabled={processing === payment.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processing === payment.id ? '...' : 'Aprobar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(payment.id)}
                            disabled={processing === payment.id}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Rechazar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-3">Instrucciones para el Cliente</h3>
        <p className="text-sm text-gray-600 mb-4">
          Cuando un cliente selecciona Yape como método de pago, debe seguir estos pasos:
        </p>
        <ol className="list-decimal ml-6 space-y-2 text-sm text-gray-700">
          <li>Realizar el pago por Yape al número: <strong>999 999 999</strong></li>
          <li>Tomar captura de pantalla del comprobante</li>
          <li>Enviar comprobante por WhatsApp junto con el número de orden</li>
          <li>Esperar confirmación del pago (se enviará por email y WhatsApp)</li>
        </ol>
      </div>
    </div>
  );
};
