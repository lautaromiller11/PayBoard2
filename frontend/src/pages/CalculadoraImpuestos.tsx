import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { FaCalculator, FaSpinner, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

interface CalculadoraInput {
  precio: string;
  moneda: 'USD' | 'ARS';
  provincia: string;
  metodo_pago: string;
  categoria_producto: string;
}

interface CalculadoraResult {
  input: {
    precio: number;
    moneda: string;
    provincia: string;
    metodo_pago: string;
    categoria_producto: string;
  };
  cotizacion: {
    tipo: string;
    valor: number;
    source: string;
    fetched_at: string;
    is_stale: boolean;
  } | null;
  desglose: {
    precio_base_ars: number;
    iva: number;
    pais: number;
    percepcion_ganancias: number;
    iibb: number;
    total: number;
  };
  meta: {
    rules_used: string[];
    warnings: string[];
  };
}

interface MetodoPago {
  value: string;
  label: string;
}

const CATEGORIAS_PRODUCTO = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'videojuego', label: 'Videojuego' },
  { value: 'software', label: 'Software' },
  { value: 'otro', label: 'Otro' }
];

export default function CalculadoraImpuestos() {
  const [input, setInput] = useState<CalculadoraInput>({
    precio: '',
    moneda: 'USD',
    provincia: '',
    metodo_pago: '',
    categoria_producto: 'otro'
  });

  const [provincias, setProvincias] = useState<string[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [result, setResult] = useState<CalculadoraResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Cargar provincias y métodos de pago al inicializar
  useEffect(() => {
    loadProvincias();
    loadMetodosPago();
  }, []);

  const loadProvincias = async () => {
    try {
      const response = await api.get('/calc-impuestos/provincias');
      setProvincias(response.data.provincias);
    } catch (error) {
      console.error('Error loading provincias:', error);
    }
  };

  const loadMetodosPago = async () => {
    try {
      const response = await api.get('/calc-impuestos/metodos-pago');
      setMetodosPago(response.data.metodos);
    } catch (error) {
      console.error('Error loading métodos de pago:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.precio || !input.provincia || !input.metodo_pago) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({
        precio: input.precio,
        moneda: input.moneda,
        provincia: input.provincia,
        metodo_pago: input.metodo_pago,
        categoria_producto: input.categoria_producto
      });

      const response = await api.get(`/calc-impuestos?${params}`);
      setResult(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al calcular impuestos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-AR');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <FaCalculator className="text-2xl text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Calculadora de Impuestos
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Precio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={input.precio}
                      onChange={(e) => setInput({...input, precio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md 
                               bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 9.99"
                      required
                    />
                  </div>
                </div>

                {/* Moneda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moneda
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="USD"
                        checked={input.moneda === 'USD'}
                        onChange={(e) => setInput({...input, moneda: e.target.value as 'USD' | 'ARS'})}
                        className="mr-2"
                      />
                      USD
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="ARS"
                        checked={input.moneda === 'ARS'}
                        onChange={(e) => setInput({...input, moneda: e.target.value as 'USD' | 'ARS'})}
                        className="mr-2"
                      />
                      ARS
                    </label>
                  </div>
                </div>

                {/* Provincia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provincia *
                  </label>
                  <select
                    value={input.provincia}
                    onChange={(e) => setInput({...input, provincia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md 
                             bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar provincia...</option>
                    {provincias.map(provincia => (
                      <option key={provincia} value={provincia}>{provincia}</option>
                    ))}
                  </select>
                </div>

                {/* Método de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Método de pago *
                  </label>
                  <select
                    value={input.metodo_pago}
                    onChange={(e) => setInput({...input, metodo_pago: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md 
                             bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar método...</option>
                    {metodosPago.map(metodo => (
                      <option key={metodo.value} value={metodo.value}>{metodo.label}</option>
                    ))}
                  </select>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría del producto
                  </label>
                  <select
                    value={input.categoria_producto}
                    onChange={(e) => setInput({...input, categoria_producto: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md 
                             bg-white dark:bg-dark-bg-primary text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIAS_PRODUCTO.map(categoria => (
                      <option key={categoria.value} value={categoria.value}>{categoria.label}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                           text-white font-medium py-2 px-4 rounded-md transition-colors
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <FaCalculator />
                      Calcular impuestos
                    </>
                  )}
                </button>
              </form>

              {/* Disclaimer */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Disclaimer:</strong> Cálculo informativo. Para asesoramiento tributario 
                    consulte a un profesional o la normativa AFIP vigente.
                  </div>
                </div>
              </div>
            </div>

            {/* Resultados */}
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
                  <div className="text-red-800 dark:text-red-200">{error}</div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Cotización usada */}
                  {result.cotizacion && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-800 dark:text-blue-200">
                            Cotización {result.cotizacion.tipo}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-300">
                            {formatCurrency(result.cotizacion.valor)} - {result.cotizacion.source}
                          </div>
                        </div>
                        {result.cotizacion.is_stale && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Cacheada
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                        {formatTimestamp(result.cotizacion.fetched_at)}
                      </div>
                    </div>
                  )}

                  {/* Desglose */}
                  <div className="bg-gray-50 dark:bg-dark-bg-accent rounded-md p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                      Desglose de impuestos
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Precio base:</span>
                        <span className="font-medium">{formatCurrency(result.desglose.precio_base_ars)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">IVA:</span>
                        <span className="font-medium">{formatCurrency(result.desglose.iva)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Imp. PAIS:</span>
                        <span className="font-medium">{formatCurrency(result.desglose.pais)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Perc. Ganancias:</span>
                        <span className="font-medium">{formatCurrency(result.desglose.percepcion_ganancias)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">IIBB:</span>
                        <span className="font-medium">{formatCurrency(result.desglose.iibb)}</span>
                      </div>
                      <hr className="my-2 border-gray-300 dark:border-gray-600" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-800 dark:text-white">Total:</span>
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(result.desglose.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {result.meta.warnings.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-4">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Observaciones:
                      </h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {result.meta.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Botón para ver detalles */}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <FaInfoCircle />
                    {showDetails ? 'Ocultar' : 'Ver'} supuestos y fuentes
                  </button>

                  {/* Detalles expandidos */}
                  {showDetails && (
                    <div className="bg-gray-50 dark:bg-dark-bg-accent rounded-md p-4 text-sm">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Reglas aplicadas:
                      </h4>
                      <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                        {result.meta.rules_used.map((rule, index) => (
                          <li key={index}>• {rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
