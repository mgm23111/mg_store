import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { cartService } from '../../api/cartService';
import { Button } from './Button';

export const CartDrawer = () => {
  const { cart, isCartOpen, closeCart, setCart, sessionId } = useCartStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      if (quantity < 1) return;
      const updatedCart = await cartService.updateItem(sessionId, itemId, quantity);
      setCart(updatedCart);
    } catch (error) {
      addToast('error', 'Error al actualizar cantidad');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const updatedCart = await cartService.removeItem(sessionId, itemId);
      setCart(updatedCart);
      addToast('success', 'Producto eliminado del carrito');
    } catch (error) {
      addToast('error', 'Error al eliminar producto');
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Carrito de Compras</h2>
          <button
            onClick={closeCart}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  {/* Image */}
                  <img
                    src={item.productImage || item.imageUrl || 'https://picsum.photos/seed/default/200/200'}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/seed/default/200/200';
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productName}</h3>
                    {item.variantInfo ? (
                      <p className="text-sm text-gray-600">{item.variantInfo}</p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {item.color?.name && item.color.name} {item.color?.name && item.size?.name && '/'} {item.size?.name && item.size.name}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      S/ {item.unitPrice.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100"
                        disabled={item.quantity >= item.availableStock}
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal:</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <Button fullWidth onClick={handleCheckout}>
              Ir a Checkout
            </Button>
            <button
              onClick={closeCart}
              className="w-full text-center text-gray-600 hover:text-gray-800"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};
