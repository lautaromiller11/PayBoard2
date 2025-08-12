
import React, { useEffect, useState } from 'react';
import CotizacionCard from '../components/CotizacionCard';
import Layout from '../components/Layout';

export type Cotizacion = {
    id: string;
    nombre: string;
    precio: number;
    variacion: number;
    icono: string;
    ultimaActualizacion: string;
    favorito: boolean;
    tendencia?: number[];
};

// Obtiene todas las cotizaciones de dólar desde DolarApi.com
async function fetchCotizaciones(): Promise<Cotizacion[]> {
    // Realiza las solicitudes en paralelo y maneja errores HTTP por endpoint
    const [resDolar, resEuro, resReal] = await Promise.all([
        fetch('https://dolarapi.com/v1/dolares'),
        fetch('https://dolarapi.com/v1/cotizaciones/eur'),
        fetch('https://dolarapi.com/v1/cotizaciones/brl'),
    ]);

    let dataDolar: any[] = [];
    let dataEuro: any | null = null;
    let dataReal: any | null = null;

    try {
        if (resDolar.ok) {
            dataDolar = await resDolar.json();
        }
    } catch { }

    try {
        if (resEuro.ok) {
            dataEuro = await resEuro.json();
        }
    } catch { }

    try {
        if (resReal.ok) {
            dataReal = await resReal.json();
        }
    } catch { }

    // Mapeo de nombre, icono y orden personalizado
    const map: Record<string, { nombre: string; icono: string }> = {
        // USD
        oficial: { nombre: 'Dólar Oficial', icono: '💵' },
        blue: { nombre: 'Dólar Blue', icono: '💶' },
        tarjeta: { nombre: 'Dólar Tarjeta', icono: '💳' },
        // Ajuste a denominaciones de la API
        bolsa: { nombre: 'Dólar MEP', icono: '📈' },
        contadoconliqui: { nombre: 'Dólar CCL', icono: '🌐' },
        cripto: { nombre: 'Dólar Cripto', icono: '⚡️' },
        mayorista: { nombre: 'Dólar Mayorista', icono: '🏦' },
        // Extras (si aparecieran)
        netflix: { nombre: 'Dólar Netflix', icono: '🎥' },
        mep: { nombre: 'Dólar MEP', icono: '📈' },
        ccl: { nombre: 'Dólar CCL', icono: '🌐' },
        futuro: { nombre: 'Dólar Futuro', icono: '🔮' },
        vitawallet: { nombre: 'Vitawallet', icono: '🟣' },
        astropay: { nombre: 'Astropay', icono: '🟠' },
        // EUR
        euro_oficial: { nombre: 'Euro Oficial', icono: '🇪🇺' },
        euro_blue: { nombre: 'Euro Blue', icono: '💶' },
        euro_tarjeta: { nombre: 'Euro Tarjeta', icono: '💳' },
        // BRL
        real_oficial: { nombre: 'Real Oficial', icono: '🇧🇷' },
        real_blue: { nombre: 'Real Blue', icono: '💶' },
        real_tarjeta: { nombre: 'Real Tarjeta', icono: '💳' },
    };

    // Dólares (lista)
    const cotizacionesDolar = (Array.isArray(dataDolar) ? dataDolar : [])
        .filter((d: any) => map[d.casa])
        .map((d: any) => ({
            id: d.casa,
            nombre: map[d.casa].nombre,
            precio: d.venta,
            variacion: 0,
            icono: map[d.casa].icono,
            ultimaActualizacion: d.fechaActualizacion,
            favorito: false,
            tendencia: [],
        }));

    // Euros (objeto único -> lista de 1)
    const cotizacionesEuro = dataEuro
        ? (() => {
            const prefixedId = `euro_${dataEuro.casa}`;
            if (!map[prefixedId]) return [] as Cotizacion[];
            return [
                {
                    id: prefixedId,
                    nombre: map[prefixedId].nombre,
                    precio: dataEuro.venta,
                    variacion: 0,
                    icono: map[prefixedId].icono,
                    ultimaActualizacion: dataEuro.fechaActualizacion,
                    favorito: false,
                    tendencia: [],
                },
            ];
        })()
        : [];

    // Reales (objeto único -> lista de 1)
    const cotizacionesReal = dataReal
        ? (() => {
            const prefixedId = `real_${dataReal.casa}`;
            if (!map[prefixedId]) return [] as Cotizacion[];
            return [
                {
                    id: prefixedId,
                    nombre: map[prefixedId].nombre,
                    precio: dataReal.venta,
                    variacion: 0,
                    icono: map[prefixedId].icono,
                    ultimaActualizacion: dataReal.fechaActualizacion,
                    favorito: false,
                    tendencia: [],
                },
            ];
        })()
        : [];

    const result = [...cotizacionesDolar, ...cotizacionesEuro, ...cotizacionesReal];

    // Si no hay ningún dato, arroja para que el componente muestre el error
    if (result.length === 0) {
        throw new Error('No se pudo obtener ninguna cotización');
    }

    return result;
}



const Cotizaciones: React.FC = () => {
    const [disponibles, setDisponibles] = useState<Cotizacion[]>([]);
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>(() => {
        const raw = localStorage.getItem('cotizacionesSeleccionadas');
        return raw ? JSON.parse(raw) : [];
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Obtiene todos los activos disponibles y actualiza los seleccionados en vivo
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const activos = await fetchCotizaciones();
                if (mounted) setDisponibles(activos);
                // Actualiza solo los seleccionados
                if (cotizaciones.length > 0) {
                    setCotizaciones(prev => prev.map(sel => activos.find(d => d.id === sel.id) || sel));
                }
            } catch (err) {
                setError('Error al cargar cotizaciones');
            } finally {
                setLoading(false);
            }
        };
        load();
        const interval = setInterval(load, 30000);
        return () => { mounted = false; clearInterval(interval); };
    }, [cotizaciones.length]);

    // Persistir cotizaciones seleccionadas en localStorage
    useEffect(() => {
        localStorage.setItem('cotizacionesSeleccionadas', JSON.stringify(cotizaciones));
    }, [cotizaciones]);

    // Agregar cotización
    const handleAddCotizacion = (id: string) => {
        const nueva = disponibles.find(c => c.id === id);
        if (nueva && !cotizaciones.find(c => c.id === id)) {
            setCotizaciones([...cotizaciones, nueva]);
        }
        setShowModal(false);
    };

    // Eliminar cotización
    const handleRemoveCotizacion = (id: string) => {
        setCotizaciones(cotizaciones.filter(c => c.id !== id));
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cotizaciones en vivo</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Consulta las principales tasas y valores actualizados al instante.</p>
                {error ? (
                    <div className="text-center text-red-500 dark:text-red-400 py-10">{error}</div>
                ) : cotizaciones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <span className="text-indigo-400 dark:text-indigo-300 text-6xl mb-4">💱</span>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">No tienes cotizaciones seleccionadas.</p>
                        <button className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 dark:border-indigo-600/50 rounded-2xl p-5 text-indigo-400 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 cursor-pointer min-h-[120px]" onClick={() => setShowModal(true)}>
                            <span className="text-4xl mb-2">+</span>
                            <span className="font-semibold">Agregar cotización</span>
                        </button>
                    </div>
                ) : loading ? (
                    <div className="text-center text-indigo-500 dark:text-indigo-300 py-10">Actualizando cotizaciones...</div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {cotizaciones.map(cot => (
                            <div className="relative group" key={cot.id}>
                                <CotizacionCard {...cot} />
                                <button className="absolute top-2 right-2 bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all" title="Eliminar" onClick={() => handleRemoveCotizacion(cot.id)}>
                                    ×
                                </button>
                            </div>
                        ))}
                        {/* Card para agregar nueva cotización */}
                        <button className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 dark:border-indigo-600/50 rounded-2xl p-5 text-indigo-400 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 cursor-pointer min-h-[220px]" onClick={() => setShowModal(true)}>
                            <span className="text-4xl mb-2">+</span>
                            <span className="font-semibold">Agregar cotización</span>
                        </button>
                    </div>
                )}
                {/* Modal para elegir cotización */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg dark:shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Selecciona una cotización</h2>
                            <div className="grid gap-3 grid-cols-2">
                                {disponibles.filter(c => !cotizaciones.find(sel => sel.id === c.id)).map(c => (
                                    <button key={c.id} className="border dark:border-dark-600 rounded-lg p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex flex-col items-center transition-colors" onClick={() => handleAddCotizacion(c.id)}>
                                        <span className="text-2xl mb-1">{c.icono}</span>
                                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">{c.nombre}</span>
                                    </button>
                                ))}
                            </div>
                            <button className="mt-6 w-full py-2 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors" onClick={() => setShowModal(false)}>Cancelar</button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Cotizaciones;
