
import React from 'react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

type CotizacionCardProps = {
    id: string;
    nombre: string;
    precio: number;
    variacion: number;
    icono: string;
    ultimaActualizacion: string;
    favorito: boolean;
    tendencia?: number[];
};

const CotizacionCard: React.FC<CotizacionCardProps> = ({ nombre, precio, variacion, icono, ultimaActualizacion, tendencia }) => {
    // Colores y flecha según variación
    const color = variacion > 0
        ? 'text-green-600 dark:text-green-500 border-green-200 dark:border-green-800/50 shadow-green-100 dark:shadow-none'
        : variacion < 0
            ? 'text-red-600 dark:text-red-500 border-red-200 dark:border-red-800/50 shadow-red-100 dark:shadow-none'
            : 'text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50 shadow-indigo-100 dark:shadow-none';
    const flecha = variacion > 0 ? '▲' : variacion < 0 ? '▼' : '';
    const flechaBg = variacion > 0
        ? 'bg-green-100 dark:bg-green-900/30'
        : variacion < 0
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-indigo-50 dark:bg-indigo-900/30';

    // Icono temporal (luego se reemplaza por SVG/librería)
    const iconoRender = (
        <span className="text-4xl font-bold mr-2 select-none" style={{ fontFamily: 'monospace' }}>{icono}</span>
    );

    return (
        <div
            className={`bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-dark-bg-secondary dark:via-dark-bg-secondary dark:to-dark-bg-secondary rounded-2xl shadow-lg border-2 ${color} p-5 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer`}
            style={{ minWidth: 0, minHeight: 220, borderColor: '#e0e7ff' }}
        >
            {/* Encabezado: icono y nombre */}
            <div className="flex items-center gap-3 mb-2">
                {iconoRender}
                <span className="font-semibold text-lg text-indigo-900 dark:text-indigo-300 truncate drop-shadow">{nombre}</span>
            </div>
            {/* Valor actual y variación */}
            <div className="flex items-center justify-between gap-2">
                <span className="text-3xl font-extrabold text-indigo-800 dark:text-indigo-400 tracking-tight drop-shadow">${precio.toLocaleString()}</span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold text-base ${color} ${flechaBg} transition-all duration-300 shadow-md bg-white/80 dark:bg-dark-bg-secondary/80 border border-indigo-100 dark:border-indigo-800/30`}>
                    {flecha}
                    {variacion}%
                </span>
            </div>

            {/* Última actualización */}
            <div className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 8v4l3 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <span>Actualizado: {ultimaActualizacion || '-'}</span>
            </div>

            {/* Micro-gráfico sparkline */}
            <div className="mt-2 h-8 w-full flex items-center justify-center bg-gradient-to-r from-indigo-100 via-blue-50 to-white dark:from-indigo-900/20 dark:via-dark-bg-secondary dark:to-dark-bg-secondary rounded-xl p-1 shadow-inner">
                {tendencia && tendencia.length > 1 ? (
                    <Sparklines data={tendencia} width={80} height={24} margin={4}>
                        <SparklinesLine color={variacion > 0 ? '#22c55e' : variacion < 0 ? '#ef4444' : '#6366f1'} style={{ fill: 'none', strokeWidth: 3 }} />
                    </Sparklines>
                ) : (
                    <span className="text-indigo-200 dark:text-indigo-700 text-xs">(sin datos)</span>
                )}
            </div>
        </div>
    );
};

export default CotizacionCard;
