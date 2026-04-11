import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../api/cartService';
import { orderService } from '../../api/orderService';
import { paymentService } from '../../api/paymentService';
import { couponService } from '../../api/couponService';
import { giftCardService } from '../../api/giftCardService';
import { shippingService, ShippingMethod } from '../../api/shippingService';
import { Cart, Coupon, GiftCard } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { CulqiCheckout } from '../../components/payment/CulqiCheckout';
import { useUIStore } from '../../stores/uiStore';
import { useCartStore } from '../../stores/cartStore';

export const Checkout = () => {
  const navigate = useNavigate();
  const { sessionId, clearCart } = useCartStore();
  const { addToast } = useUIStore();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Customer Info
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    documentType: 'DNI',
    documentNumber: '',
  });

  // Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Perú',
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'CULQI' | 'YAPE'>('CULQI');
  const [showCulqiForm, setShowCulqiForm] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');

  // Applied discounts
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [applyingGiftCard, setApplyingGiftCard] = useState(false);

  // Shipping
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<number | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await cartService.getCart(sessionId);

        if (!data || data.items.length === 0) {
          addToast('error', 'Tu carrito está vacío');
          navigate('/productos');
          return;
        }

        setCart(data);
      } catch (error) {
        addToast('error', 'Error al cargar el carrito');
        navigate('/productos');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [sessionId, navigate, addToast]);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const methods = await shippingService.getActiveShippingMethods();
        setShippingMethods(methods);
        // Auto-select first method if available
        if (methods.length > 0 && !selectedShippingMethod) {
          setSelectedShippingMethod(methods[0].id);
        }
      } catch (error) {
        addToast('error', 'Error al cargar métodos de envío');
      }
    };

    fetchShippingMethods();
  }, [addToast]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!cart) return;

    try {
      setApplyingCoupon(true);
      const validatedCoupon = await couponService.validateCoupon(couponCode);

      // Check minimum purchase amount
      if (cart.subtotal < validatedCoupon.minPurchaseAmount) {
        addToast('error', `Compra mínima requerida: S/ ${validatedCoupon.minPurchaseAmount.toFixed(2)}`);
        return;
      }

      setAppliedCoupon(validatedCoupon);
      addToast('success', 'Cupón aplicado correctamente');
      setCouponCode('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Cupón inválido o expirado';
      addToast('error', errorMessage);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) return;

    try {
      setApplyingGiftCard(true);
      const validatedGiftCard = await giftCardService.validateGiftCard(giftCardCode);

      // Check if gift card has balance
      if (validatedGiftCard.currentBalance <= 0) {
        addToast('error', 'Esta gift card no tiene saldo disponible');
        return;
      }

      setAppliedGiftCard(validatedGiftCard);
      addToast('success', 'Gift card aplicada correctamente');
      setGiftCardCode('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gift card inválida o expirada';
      addToast('error', errorMessage);
    } finally {
      setApplyingGiftCard(false);
    }
  };

  // Calculate discount amount from coupon
  const calculateCouponDiscount = (): number => {
    if (!appliedCoupon || !cart) return 0;

    if (appliedCoupon.type === 'PERCENTAGE') {
      return (cart.subtotal * appliedCoupon.value) / 100;
    } else {
      // FIXED_AMOUNT
      return appliedCoupon.value;
    }
  };

  // Calculate gift card amount to use
  const calculateGiftCardAmount = (): number => {
    if (!appliedGiftCard || !cart) return 0;

    const subtotalAfterCoupon = cart.subtotal - calculateCouponDiscount();
    // Use the minimum between gift card balance and remaining amount
    return Math.min(appliedGiftCard.currentBalance, subtotalAfterCoupon);
  };

  // Calculate shipping cost
  const calculateShippingCost = (): number => {
    if (!selectedShippingMethod) return 0;
    const method = shippingMethods.find(m => m.id === selectedShippingMethod);
    return method ? method.basePrice : 0;
  };

  // Calculate final total
  const calculateFinalTotal = (): number => {
    if (!cart) return 0;

    const couponDiscount = calculateCouponDiscount();
    const giftCardAmount = calculateGiftCardAmount();
    const shippingCost = calculateShippingCost();
    const total = cart.subtotal - couponDiscount - giftCardAmount + shippingCost;

    return Math.max(0, total); // Never go below 0
  };

  const validateForm = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.documentNumber) {
      addToast('error', 'Por favor completa todos los campos del cliente');
      return false;
    }

    if (!selectedShippingMethod) {
      addToast('error', 'Por favor selecciona un método de envío');
      return false;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      addToast('error', 'Por favor completa todos los campos de envío');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      addToast('error', 'Email inválido');
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm() || !cart) return;

    try {
      setProcessing(true);

      // Create order - using checkout instead of create
      const orderRequest = {
        sessionId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        shippingAddress: {
          fullName: customerInfo.name,
          phone: customerInfo.phone,
          addressLine1: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        shippingMethodId: selectedShippingMethod!,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        giftCardCode: appliedGiftCard?.code,
      };

      const order = await orderService.checkout(orderRequest);

      // Process payment based on method
      if (paymentMethod === 'CULQI') {
        // Show Culqi payment form for tokenization
        setPendingOrderId(order.id);
        setPendingOrderNumber(order.orderNumber);
        setShowCulqiForm(true);
        setProcessing(false);

      } else if (paymentMethod === 'YAPE') {
        // Clear cart after order creation
        try {
          await cartService.clearCart(sessionId);
          clearCart(); // Clear local state
        } catch (cartError) {
          console.error('Error clearing cart:', cartError);
          // Don't fail the whole process if cart clearing fails
        }

        // For Yape, payment is created automatically with the order
        addToast('success', 'Orden creada. Por favor completa el pago con Yape.');
        navigate(`/orden-confirmada/${order.orderNumber}`);
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al procesar la orden';
      addToast('error', errorMessage);
      setProcessing(false);
    }
  };

  const handleCulqiSuccess = async (token: string) => {
    if (!pendingOrderId || !pendingOrderNumber) return;

    try {
      setProcessing(true);
      setShowCulqiForm(false);

      // Show processing message
      addToast('info', 'Procesando tu pago...');

      // Process payment with Culqi token
      await paymentService.processCulqi(pendingOrderId, token);

      // Clear cart after successful payment
      try {
        await cartService.clearCart(sessionId);
        clearCart(); // Clear local state
      } catch (cartError) {
        console.error('Error clearing cart:', cartError);
        // Don't fail the whole process if cart clearing fails
      }

      addToast('success', '¡Pago procesado exitosamente!');

      // Small delay to show success message before navigating
      setTimeout(() => {
        navigate(`/orden-confirmada/${pendingOrderNumber}`);
      }, 500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al procesar el pago';
      addToast('error', errorMessage);
      setShowCulqiForm(false);
      setPendingOrderId(null);
      setPendingOrderNumber(null);
      setProcessing(false);
    }
  };

  const handleCulqiError = (error: string) => {
    addToast('error', error);
    setShowCulqiForm(false);
    setPendingOrderId(null);
    setPendingOrderNumber(null);
  };

  if (loading) {
    return <Loading />;
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo"
                required
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
              />
              <Input
                label="Email"
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
              />
              <Input
                label="Teléfono"
                type="tel"
                required
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo de documento
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={customerInfo.documentType}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, documentType: e.target.value })
                  }
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carnet de Extranjería</option>
                </select>
              </div>
              <Input
                label="Número de documento"
                required
                value={customerInfo.documentNumber}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, documentNumber: e.target.value })
                }
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Dirección de Envío</h2>
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Dirección"
                required
                value={shippingAddress.street}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, street: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ciudad"
                  required
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                />
                <Input
                  label="Departamento"
                  required
                  value={shippingAddress.state}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, state: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Código Postal"
                  required
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                  }
                />
                <Input
                  label="País"
                  disabled
                  value={shippingAddress.country}
                />
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Método de Envío</h2>
            <div className="space-y-3">
              {shippingMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedShippingMethod === method.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={selectedShippingMethod === method.id}
                      onChange={() => setSelectedShippingMethod(method.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{method.name}</div>
                      <div className="text-sm text-gray-600">
                        Entrega estimada: {method.estimatedDays}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-purple-600">
                    {method.basePrice === 0 ? 'GRATIS' : `S/ ${method.basePrice.toFixed(2)}`}
                  </div>
                </label>
              ))}
            </div>
            {shippingMethods.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No hay métodos de envío disponibles
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>

            {!showCulqiForm ? (
              <div className="space-y-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  paymentMethod === 'CULQI' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CULQI"
                    checked={paymentMethod === 'CULQI'}
                    onChange={() => setPaymentMethod('CULQI')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Tarjeta de Crédito/Débito (Culqi)</div>
                    <div className="text-sm text-gray-600">Pago procesado inmediatamente</div>
                  </div>
                </label>
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  paymentMethod === 'YAPE' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="YAPE"
                    checked={paymentMethod === 'YAPE'}
                    onChange={() => setPaymentMethod('YAPE')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Yape</div>
                    <div className="text-sm text-gray-600">
                      Transferencia por Yape (requiere confirmación manual)
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCulqiForm(false);
                      setPendingOrderId(null);
                      setPendingOrderNumber(null);
                    }}
                  >
                    ← Volver a métodos de pago
                  </Button>
                </div>
                <CulqiCheckout
                  amount={calculateFinalTotal()}
                  description={`Orden ${pendingOrderNumber ?? ''} - MG Store`}
                  orderNumber={pendingOrderNumber ?? undefined}
                  onSuccess={handleCulqiSuccess}
                  onError={handleCulqiError}
                />
              </>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b">
                  <img
                    src={item.productImage || '/placeholder.jpg'}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {item.productName}
                    </h4>
                    {item.variantInfo && (
                      <p className="text-xs text-gray-500">{item.variantInfo}</p>
                    )}
                    <p className="text-sm">
                      {item.quantity} x S/ {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm font-semibold">
                    S/ {item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Cupón de descuento</label>
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">
                        {appliedCoupon.type === 'PERCENTAGE'
                          ? `${appliedCoupon.value}% de descuento`
                          : `S/ ${appliedCoupon.value.toFixed(2)} de descuento`}
                      </p>
                    </div>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Código"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    variant="outline"
                    size="sm"
                    disabled={applyingCoupon || !couponCode.trim()}
                  >
                    {applyingCoupon ? 'Validando...' : 'Aplicar'}
                  </Button>
                </div>
              )}
            </div>

            {/* Gift Card */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Gift Card</label>
              {appliedGiftCard ? (
                <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-purple-800">{appliedGiftCard.code}</p>
                      <p className="text-sm text-purple-600">
                        Saldo: S/ {appliedGiftCard.currentBalance.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => setAppliedGiftCard(null)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Código"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyGiftCard()}
                  />
                  <Button
                    onClick={handleApplyGiftCard}
                    variant="outline"
                    size="sm"
                    disabled={applyingGiftCard || !giftCardCode.trim()}
                  >
                    {applyingGiftCard ? 'Validando...' : 'Aplicar'}
                  </Button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>S/ {cart.subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Cupón ({appliedCoupon.code}):</span>
                  <span>- S/ {calculateCouponDiscount().toFixed(2)}</span>
                </div>
              )}
              {appliedGiftCard && (
                <div className="flex justify-between text-sm text-purple-600">
                  <span>Gift Card ({appliedGiftCard.code}):</span>
                  <span>- S/ {calculateGiftCardAmount().toFixed(2)}</span>
                </div>
              )}
              {selectedShippingMethod && (
                <div className="flex justify-between text-sm">
                  <span>Envío ({shippingMethods.find(m => m.id === selectedShippingMethod)?.name}):</span>
                  <span>
                    {calculateShippingCost() === 0
                      ? 'GRATIS'
                      : `S/ ${calculateShippingCost().toFixed(2)}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>S/ {calculateFinalTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            {!showCulqiForm && (
              <Button
                onClick={handleSubmitOrder}
                disabled={processing}
                className="w-full mt-6"
                size="lg"
              >
                {processing ? 'Procesando...' : 'Finalizar Compra'}
              </Button>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              Al completar tu compra, aceptas nuestros términos y condiciones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
