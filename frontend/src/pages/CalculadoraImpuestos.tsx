import React, { useEffect, useRef, useState } from 'react';
import { FaCalculator, FaSpinner, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import Layout from '../components/Layout'; // ajusta la ruta si hace falta

// -------------------- TIPOS --------------------
interface PaymentMethod {
  value: string;
  label: string;
}

interface CalculationInput {
  precio: string;
  moneda: 'USD' | 'ARS';
  provincia: string;
  metodo_pago: string;
}

interface CalculationResult {
  input: {
    precio: number;
    moneda: string;
    provincia: string;
    metodo_pago: string;
  };
  cotizacion?: {
    tipo: string;
    valor: number;
    source: string;
    fetched_at: string;
    is_stale: boolean;
  };
  desglose: {
    precio_base_ars: number;
    iva: number;
    percepcion_ganancias: number;
  percepcion_ganancias: number;
    iibb: number;
    total: number;
  };
  meta: {
    warnings: string[];
    rules_used: string[];
  };
}

// -------------------- COMPONENTES AUXILIARES --------------------

// Switch de moneda (USD / ARS)
interface CurrencySwitchProps {
  currency: 'USD' | 'ARS';
  onCurrencyChange: (currency: 'USD' | 'ARS') => void;
  disabled?: boolean;
}
const CurrencySwitch: React.FC<CurrencySwitchProps> = ({ currency, onCurrencyChange, disabled = false }) => (
  <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-200">
    <button
      type="button"
      onClick={() => onCurrencyChange('USD')}
      disabled={disabled}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
        currency === 'USD'
          ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      USD
    </button>
    <button
      type="button"
      onClick={() => onCurrencyChange('ARS')}
      disabled={disabled}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
        currency === 'ARS'
          ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      ARS
    </button>
  </div>
);

// Select personalizado de métodos de pago
interface MetodoPagoSelectProps {
  value: string;
  onChange: (value: string) => void;
  metodos: PaymentMethod[];
  required?: boolean;
}
const MetodoPagoSelect: React.FC<MetodoPagoSelectProps> = ({ value, onChange, metodos, required = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = metodos.find(m => m.value === value)?.label || 'Seleccionar método...';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
      >
        <span className={value ? '' : 'text-gray-400'}>{selectedLabel}</span>
        <svg className={`w-5 h-5 ml-2 transition-transform ${open ? 'rotate-180' : ''} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          role="listbox"
        >
          <li
            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${!value ? 'text-violet-600 font-semibold' : 'text-gray-400'}`}
            onClick={() => { onChange(''); setOpen(false); }}
            role="option"
            aria-selected={!value}
          >
            Seleccionar método...
          </li>

          {metodos.map(metodo => (
            <li
              key={metodo.value}
              className={`px-3 py-2 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/40 ${value === metodo.value ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-semibold' : ''}`}
              onClick={() => { onChange(metodo.value); setOpen(false); }}
              role="option"
              aria-selected={value === metodo.value}
            >
              {metodo.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Select personalizado de provincias (con scroll)
interface ProvinceSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}
const ProvinceSelect: React.FC<ProvinceSelectProps> = ({ value, onChange, required = false }) => {
  const provincias = [
    'CABA',
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = value || 'Seleccionar provincia...';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required}
      >
        <span className={value ? '' : 'text-gray-400'}>{selectedLabel}</span>
        <svg className={`w-5 h-5 ml-2 transition-transform ${open ? 'rotate-180' : ''} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          role="listbox"
        >
          <li
            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${!value ? 'text-violet-600 font-semibold' : 'text-gray-400'}`}
            onClick={() => { onChange(''); setOpen(false); }}
            role="option"
            aria-selected={!value}
          >
            Seleccionar provincia...
          </li>

          {provincias.map(prov => (
            <li
              key={prov}
              className={`px-3 py-2 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/40 ${value === prov ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 font-semibold' : ''}`}
              onClick={() => { onChange(prov); setOpen(false); }}
              role="option"
              aria-selected={value === prov}
            >
              {prov}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// -------------------- COMPONENTE PRINCIPAL --------------------

export default function CalculadoraImpuestos(): JSX.Element {
  const [input, setInput] = useState<CalculationInput>({
    precio: '',
    moneda: 'USD',
    provincia: '',
    metodo_pago: ''
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [metodosPago, setMetodosPago] = useState<PaymentMethod[]>([]);

  // Cargar métodos de pago
  useEffect(() => {
    const fetchMetodosPago = async () => {
      try {
        const response = await fetch('/api/calc-impuestos/metodos-pago');
        if (response.ok) {
          const data = await response.json();
          setMetodosPago(data.metodos ?? []);
        } else {
          // fallback
          setMetodosPago([
            { value: 'tarjeta_pesificado', label: 'Tarjeta (Pesificado)' },
            { value: 'tarjeta_dolares_cuenta', label: 'Tarjeta (USD en cuenta)' },
            { value: 'mercado_pago', label: 'Mercado Pago' },
            { value: 'crypto', label: 'Cryptomonedas' },
          ]);
        }
      } catch {
        setMetodosPago([
          { value: 'tarjeta_pesificado', label: 'Tarjeta (Pesificado)' },
          { value: 'tarjeta_dolares_cuenta', label: 'Tarjeta (USD en cuenta)' },
          { value: 'mercado_pago', label: 'Mercado Pago' },
          { value: 'crypto', label: 'Cryptomonedas' },
        ]);
      }
    };

    fetchMetodosPago();
  }, []);

  // Utilidades de formato
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Llamada para calcular impuestos
  const calculateTaxes = async () => {
    if (!input.precio || !input.provincia || !input.metodo_pago) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        precio: input.precio,
        moneda: input.moneda,
        provincia: input.provincia,
        metodo_pago: input.metodo_pago
      });

      const response = await fetch(`/api/calc-impuestos?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al calcular impuestos');
      }

      const data = await response.json();
      setResult(data as CalculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Submit del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTaxes();
  };

  // Cambio de moneda (recalcula si hay datos)
  const handleCurrencyChange = (newCurrency: 'USD' | 'ARS') => {
    setInput(prev => ({ ...prev, moneda: newCurrency }));
    // recalculo suave si hay datos completos
    if (input.precio && input.provincia && input.metodo_pago) {
      // pequeña demora para asegurarse que state se propague
      setTimeout(() => calculateTaxes(), 100);
    }
  };

  // Recalculo automático al cambiar inputs (debounce)
  useEffect(() => {
    if (input.precio && input.provincia && input.metodo_pago) {
      const id = setTimeout(() => calculateTaxes(), 300);
      return () => clearTimeout(id);
    }
  }, [input.precio, input.provincia, input.metodo_pago, input.moneda]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-6 px-1 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">Calculadora de Impuestos</h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-base text-[15px] leading-snug">
            Calcula el precio final incluyendo impuestos para compras en USD o ARS según tu provincia y método de pago.
          </p>
        </div>

        {/* Contenido */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
          {/* Izquierda: Formulario */}
          <div className="w-full max-w-md mx-auto lg:w-96 lg:flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FaCalculator className="text-blue-600 dark:text-blue-400 text-lg" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Datos del cálculo</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Precio + Moneda */}
                <div>
                  <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Precio</label>
                  <div className="flex flex-col xs:flex-row gap-2 items-stretch xs:items-center w-full">
                    <input
                      id="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      value={input.precio}
                      onChange={e => setInput(prev => ({ ...prev, precio: e.target.value }))}
                      placeholder="120.00"
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-base"
                      aria-describedby="precio-help"
                    />
                    <div className="w-full xs:w-auto flex-shrink-0">
                      <CurrencySwitch currency={input.moneda} onCurrencyChange={handleCurrencyChange} />
                    </div>
                  </div>
                </div>

                {/* Método de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de pago</label>
                  <MetodoPagoSelect
                    value={input.metodo_pago}
                    onChange={(value) => setInput(prev => ({ ...prev, metodo_pago: value }))}
                    metodos={metodosPago}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El método de pago afecta los impuestos aplicables</p>
                </div>

                {/* Provincia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provincia</label>
                  <ProvinceSelect
                    value={input.provincia}
                    onChange={(value) => setInput(prev => ({ ...prev, provincia: value }))}
                    required
                  />
                </div>

                {/* Botón calcular */}
                <div>
                  <button
                    type="submit"
                    disabled={loading || !input.precio || !input.provincia || !input.metodo_pago}
                    className="w-full max-w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Calculando...
                      </>
                    ) : (
                      <>
                        <FaCalculator />
                        Calcular Impuestos
                      </>
                    )}
                  </button>
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex items-start gap-2 text-gray-600 dark:text-gray-400 text-sm">
                    <FaInfoCircle className="mt-0.5 text-lg text-gray-400 dark:text-gray-500" />
                    <span>
                      Esta herramienta calcula el precio final incluyendo todos los impuestos aplicables según tu ubicación y método de pago: IVA, percepciones a cuenta de Ganancias y IIBB.
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Derecha: Resultados */}
          <div className="w-full max-w-md mx-auto mt-8 lg:mt-0 lg:w-[28rem] lg:flex-shrink-0">
            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-6 shadow-sm">
                <div className="text-red-800 dark:text-red-200 text-sm flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-600 dark:text-red-400" />
                  {error}
                </div>
              </div>
            )}

            {/* Vista de carga */}
            {loading && !error && !result && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-20">
                <FaSpinner className="animate-spin text-4xl text-violet-600 mb-4" />
                <span className="text-violet-700 dark:text-violet-300 font-medium text-lg">Calculando...</span>
              </div>
            )}

            {/* Vista de bienvenida/placeholder */}
            {!loading && !error && !result && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-32">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-4">
                  <FaCalculator className="text-blue-600 dark:text-blue-400 text-4xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¿Listo para calcular?</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center max-w-xs">Completa el formulario de la izquierda para ver el desglose completo de impuestos en tiempo real.</p>
              </div>
            )}

            {/* Resultado */}
            {result && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-xl">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-600 rounded-t-xl">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FaInfoCircle className="text-green-600 dark:text-green-400" />
                    </div>
                    Resultado del cálculo
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Cotización */}
                  {result.cotizacion && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Cotización utilizada</h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-blue-800 dark:text-blue-200 text-sm">
                              Tipo: {result.cotizacion.tipo.charAt(0).toUpperCase() + result.cotizacion.tipo.slice(1)}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              Valor: {formatCurrency(result.cotizacion.valor)}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              Fuente: {result.cotizacion.source}
                            </div>
                          </div>

                          <div className="text-right">
                            {result.cotizacion.is_stale && (
                              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded">No disponible</span>
                            )}
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Actualización: {formatTimestamp(result.cotizacion.fetched_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Datos de entrada */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Datos de entrada</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {result.input.moneda} {result.input.precio.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Provincia:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{result.input.provincia}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Método de pago:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {metodosPago.find(m => m.value === result.input.metodo_pago)?.label || result.input.metodo_pago}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desglose */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">Desglose de impuestos</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700 dark:text-gray-300">Precio base</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(result.desglose.precio_base_ars)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">IVA</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(result.desglose.iva)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Percepción Ganancias (30%)</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(result.desglose.percepcion_ganancias)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          IIBB {result.input.provincia}{' '}
                          {(() => {
                            const iibbRule = result.meta.rules_used.find(rule => rule.includes('IIBB'));
                            if (iibbRule) {
                              const match = iibbRule.match(/(\d+(?:\.\d+)?)%/);
                              return match ? `(${match[1]}%)` : '';
                            }
                            return '';
                          })()}
                        </span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(result.desglose.iibb)}</span>
                      </div>

                      <hr className="border-gray-200 dark:border-gray-600" />

                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-green-600 dark:text-green-400">{formatCurrency(result.desglose.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer legal */}
                  <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Los datos mostrados son aproximados y no representan valores oficiales ni legales. Para información oficial, consulte a un experto o profesional matriculado.
                  </div>

                  {/* Ver detalles */}
                  <button
                    onClick={() => setShowDetails(s => !s)}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors duration-150"
                    type="button"
                  >
                    <FaInfoCircle />
                    {showDetails ? 'Ocultar' : 'Ver'} supuestos y fuentes
                  </button>

                  {/* Detalles expandidos */}
                  {showDetails && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2 text-sm">Reglas aplicadas:</h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        {result.meta.rules_used.map((rule, idx) => <li key={idx}>• {rule}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
