export const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-3xl font-bold">Terminos y Condiciones</h1>
        <div className="space-y-4 text-gray-700">
          <p>
            Estos terminos regulan el uso del sitio web MG Store y la compra de productos.
            Al realizar una compra, aceptas estas condiciones.
          </p>
          <h2 className="pt-2 text-xl font-semibold">1. Compras y pagos</h2>
          <p>
            Todas las compras estan sujetas a validacion de stock y confirmacion de pago.
            Los metodos de pago disponibles se muestran durante el checkout.
          </p>
          <h2 className="pt-2 text-xl font-semibold">2. Envios y entregas</h2>
          <p>
            Los tiempos de entrega son estimados y pueden variar por zona geografica.
            El cliente debe proporcionar datos de envio correctos y completos.
          </p>
          <h2 className="pt-2 text-xl font-semibold">3. Cambios y devoluciones</h2>
          <p>
            Las solicitudes de cambio o devolucion se evaluan segun la politica comercial vigente
            y el estado del producto al momento de la solicitud.
          </p>
          <h2 className="pt-2 text-xl font-semibold">4. Limitacion de responsabilidad</h2>
          <p>
            MG Store no sera responsable por interrupciones del servicio causadas por terceros,
            eventos de fuerza mayor o mantenimientos programados.
          </p>
          <p className="pt-2 text-sm text-gray-500">
            Ultima actualizacion: 10 de marzo de 2026.
          </p>
        </div>
      </div>
    </div>
  );
};
