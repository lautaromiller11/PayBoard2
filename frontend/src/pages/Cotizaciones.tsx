
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
    // Fetch dólares
    const resDolar = await fetch('https://dolarapi.com/v1/dolares');
    const dataDolar = await resDolar.json();
    // Fetch euros
    const resEuro = await fetch('https://dolarapi.com/v1/euro');
    const dataEuro = await resEuro.json();
    // Fetch reales
    const resReal = await fetch('https://dolarapi.com/v1/real');
    const dataReal = await resReal.json();

    // Mapeo de nombre, icono y orden personalizado
    const map: Record<string, { nombre: string; icono: string }> = {
        oficial: { nombre: 'Dólar Oficial', icono: '💵' },
        blue: { nombre: 'Dólar Blue', icono: '💶' },
        tarjeta: { nombre: 'Dólar Tarjeta', icono: '💳' },
        netflix: { nombre: 'Dólar Netflix', icono: '🎥' },
        mep: { nombre: 'Dólar MEP', icono: '📈' },
        ccl: { nombre: 'Dólar CCL', icono: '🌐' },
        vitawallet: { nombre: 'Vitawallet', icono: '🟣' },
        astropay: { nombre: 'Astropay', icono: '🟠' },
        cripto: { nombre: 'Dólar Cripto', icono: '⚡️' },
        mayorista: { nombre: 'Dólar Mayorista', icono: '🏦' },
        futuro: { nombre: 'Dólar Futuro', icono: '🔮' },
        // Euros
        euro_oficial: { nombre: 'Euro Oficial', icono: '🇪🇺' },
        euro_blue: { nombre: 'Euro Blue', icono: '💶' },
        euro_tarjeta: { nombre: 'Euro Tarjeta', icono: '💳' },
        // Reales
        real_oficial: { nombre: 'Real Oficial', icono: '🇧🇷' },
        real_blue: { nombre: 'Real Blue', icono: '💶' },
        real_tarjeta: { nombre: 'Real Tarjeta', icono: '💳' },
    };

    // Dólares
    const cotizacionesDolar = dataDolar
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

    // Euros
    const cotizacionesEuro = dataEuro
        .filter((e: any) => map[e.casa])
        .map((e: any) => ({
            id: e.casa,
            nombre: map[e.casa].nombre,
            precio: e.venta,
            variacion: 0,
            icono: map[e.casa].icono,
            ultimaActualizacion: e.fechaActualizacion,
            favorito: false,
            tendencia: [],
        }));

    // Reales
    const cotizacionesReal = dataReal
        .filter((r: any) => map[r.casa])
        .map((r: any) => ({
            id: r.casa,
            nombre: map[r.casa].nombre,
            precio: r.venta,
            variacion: 0,
            icono: map[r.casa].icono,
            ultimaActualizacion: r.fechaActualizacion,
            favorito: false,
            tendencia: [],
        }));

    return [...cotizacionesDolar, ...cotizacionesEuro, ...cotizacionesReal];
}




const Cotizaciones: React.FC = () => {
    const [disponibles, setDisponibles] = useState<Cotizacion[]>([]);
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Cotizaciones en vivo</h1>
                <p className="text-gray-600 mb-6">Consulta las principales tasas y valores actualizados al instante.</p>
                {error ? (
                    <div className="text-center text-red-500 py-10">{error}</div>
                ) : cotizaciones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <span className="text-indigo-400 text-6xl mb-4">💱</span>
                        <p className="text-lg text-gray-600 mb-4">No tienes cotizaciones seleccionadas.</p>
                        <button className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-2xl p-5 text-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer min-h-[120px]" onClick={() => setShowModal(true)}>
                            <span className="text-4xl mb-2">+</span>
                            <span className="font-semibold">Agregar cotización</span>
                        </button>
                    </div>
                ) : loading ? (
                    <div className="text-center text-indigo-500 py-10">Actualizando cotizaciones...</div>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {cotizaciones.map(cot => (
                            <div className="relative group" key={cot.id}>
                                <CotizacionCard {...cot} />
                                <button className="absolute top-2 right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition" title="Eliminar" onClick={() => handleRemoveCotizacion(cot.id)}>
                                    ×
                                </button>
                            </div>
                        ))}
                        {/* Card para agregar nueva cotización */}
                        <button className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-2xl p-5 text-indigo-400 hover:bg-indigo-50 transition-all duration-200 cursor-pointer min-h-[220px]" onClick={() => setShowModal(true)}>
                            <span className="text-4xl mb-2">+</span>
                            <span className="font-semibold">Agregar cotización</span>
                        </button>
                    </div>
                )}
                {/* Modal para elegir cotización */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Selecciona una cotización</h2>
                            <div className="grid gap-3 grid-cols-2">
                                {disponibles.filter(c => !cotizaciones.find(sel => sel.id === c.id)).map(c => (
                                    <button key={c.id} className="border rounded-lg p-3 hover:bg-indigo-50 flex flex-col items-center" onClick={() => handleAddCotizacion(c.id)}>
                                        <span className="text-2xl mb-1">{c.icono}</span>
                                        <span className="font-semibold text-indigo-700">{c.nombre}</span>
                                    </button>
                                ))}
                            </div>
                            <button className="mt-6 w-full py-2 rounded bg-indigo-100 text-indigo-600 font-semibold" onClick={() => setShowModal(false)}>Cancelar</button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Cotizaciones;
