import React, { useId } from 'react';
import Modal from './Modal';

// Las clases van completas (no armadas con plantillas) para que Tailwind las detecte.
const COLORES = {
  red:    { icono: 'bg-red-100 text-red-600',       boton: 'bg-red-600 hover:bg-red-700',       sombra: 'shadow-red-500/30' },
  blue:   { icono: 'bg-blue-100 text-blue-600',     boton: 'bg-blue-600 hover:bg-blue-700',     sombra: 'shadow-blue-500/30' },
  green:  { icono: 'bg-green-100 text-green-600',   boton: 'bg-green-600 hover:bg-green-700',   sombra: 'shadow-green-500/30' },
  yellow: { icono: 'bg-yellow-100 text-yellow-600', boton: 'bg-yellow-500 hover:bg-yellow-600', sombra: 'shadow-yellow-500/30' },
};

const VARIANTES = {
  // Confirmaciones y avisos rápidos
  compacto: {
    tarjeta: 'rounded-2xl p-8',
    icono: 'w-16 h-16 mb-4',
    iconoTexto: 'text-3xl',
    titulo: 'text-xl font-bold mb-2',
    cuerpo: 'text-gray-500 mb-6 text-sm',
    botones: 'flex gap-3',
    boton: 'flex-1 py-3 rounded-xl',
    sombraConfirmar: () => 'shadow-md',
  },
  // Momentos importantes del examen (iniciar, entregar)
  destacado: {
    tarjeta: 'rounded-3xl p-10',
    icono: 'w-16 h-16 mb-6',
    iconoTexto: 'text-3xl',
    titulo: 'text-2xl font-bold mb-2',
    cuerpo: 'text-gray-500 mb-8 text-sm',
    botones: 'flex gap-4',
    boton: 'flex-1 py-3.5 rounded-xl',
    sombraConfirmar: (color) => `shadow-lg ${color.sombra}`,
  },
  // Advertencias fuertes (salir del examen y perder el progreso)
  alerta: {
    tarjeta: 'rounded-3xl p-10',
    icono: 'w-20 h-20 mb-6',
    iconoTexto: 'text-5xl',
    titulo: 'text-3xl font-extrabold mb-3',
    cuerpo: 'text-gray-600 mb-8 leading-relaxed',
    botones: 'flex flex-col gap-4',
    boton: 'w-full py-4 rounded-2xl text-lg',
    sombraConfirmar: () => 'shadow-md',
  },
};

/**
 * Diálogo de confirmación o aviso.
 * - Con `onCancelar`: muestra los botones Cancelar / Confirmar.
 * - Sin `onCancelar`: muestra un solo botón (aviso tipo "Entendido").
 * El cuerpo del mensaje va como `children`.
 */
function Dialogo({
  abierto,
  icono,
  color = 'blue',
  titulo,
  children,
  textoConfirmar = 'Aceptar',
  onConfirmar,
  textoCancelar = 'Cancelar',
  onCancelar,
  variante = 'compacto',
  ancho = 'sm',
  overlayFuerte = false,
}) {
  const idTitulo = useId();
  const v = VARIANTES[variante];
  const c = COLORES[color];

  return (
    <Modal abierto={abierto} ancho={ancho} overlayFuerte={overlayFuerte} className={`${v.tarjeta} text-center`} aria-labelledby={idTitulo}>
      <div className={`flex items-center justify-center mx-auto rounded-full ${v.icono} ${c.icono}`}>
        <span className={`material-symbols-outlined ${v.iconoTexto}`}>{icono}</span>
      </div>

      <h3 id={idTitulo} className={`text-gray-900 ${v.titulo}`}>{titulo}</h3>
      <div className={v.cuerpo}>{children}</div>

      <div className={v.botones}>
        {onCancelar && (
          <button onClick={onCancelar} className={`${v.boton} bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold cursor-pointer transition-colors border-none outline-none`}>
            {textoCancelar}
          </button>
        )}
        <button onClick={onConfirmar} className={`${v.boton} ${c.boton} ${v.sombraConfirmar(c)} text-white font-bold cursor-pointer transition-colors border-none outline-none`}>
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}

export default Dialogo;
