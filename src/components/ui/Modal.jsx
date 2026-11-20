import React from 'react';

const ANCHOS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

/**
 * Contenedor base de los modales: fondo oscurecido + tarjeta centrada.
 * No decide el contenido; para confirmaciones y avisos usa <Dialogo>.
 */
function Modal({ abierto, ancho = 'sm', overlayFuerte = false, className = '', children, ...props }) {
  if (!abierto) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${overlayFuerte ? 'bg-gray-900/80 backdrop-blur-md' : 'bg-gray-900/50 backdrop-blur-sm'}`}>
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-white shadow-2xl w-full ${ANCHOS[ancho]} overflow-hidden transform transition-all border border-gray-100 ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
