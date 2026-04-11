import { useUIStore } from '../../stores/uiStore';
import clsx from 'clsx';

export const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'min-w-[300px] px-4 py-3 rounded-lg shadow-lg flex items-center justify-between animate-slide-in',
            {
              'bg-green-500 text-white': toast.type === 'success',
              'bg-red-500 text-white': toast.type === 'error',
              'bg-blue-500 text-white': toast.type === 'info',
              'bg-yellow-300 text-gray-900': toast.type === 'warning',
            }
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className={clsx('ml-4', {
              'text-white hover:text-gray-200': toast.type !== 'warning',
              'text-gray-700 hover:text-gray-900': toast.type === 'warning',
            })}
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
};
