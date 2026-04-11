export const TrustBadges = () => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TrustBadge
          icon="🔒"
          title="Pago Seguro"
          description="Tu información está protegida con encriptación de 256 bits"
        />
        <TrustBadge
          icon="🚚"
          title="Envío Confiable"
          description="Seguimiento en tiempo real de tu pedido"
        />
        <TrustBadge
          icon="↩️"
          title="Devoluciones Fáciles"
          description="30 días para devolver productos sin preguntas"
        />
      </div>
    </div>
  );
};

interface TrustBadgeProps {
  icon: string;
  title: string;
  description: string;
}

const TrustBadge = ({ icon, title, description }: TrustBadgeProps) => {
  return (
    <div className="flex items-start gap-3">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Compact version for checkout
export const TrustBadgesCompact = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6 py-4 border-t border-b border-gray-200 my-6">
      <CompactBadge icon="🔒" text="Pago Seguro" />
      <CompactBadge icon="🚚" text="Envío Gratis" />
      <CompactBadge icon="✓" text="Garantizado" />
      <CompactBadge icon="💳" text="Múltiples Métodos" />
    </div>
  );
};

const CompactBadge = ({ icon, text }: { icon: string; text: string }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{text}</span>
    </div>
  );
};

// Security seal for payment pages
export const SecuritySeal = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🛡️</div>
        <div>
          <h4 className="font-semibold text-green-900 text-sm">
            Compra 100% Segura
          </h4>
          <p className="text-xs text-green-700">
            Procesado de forma segura por Culqi. No almacenamos tu información de tarjeta.
          </p>
        </div>
      </div>
    </div>
  );
};
