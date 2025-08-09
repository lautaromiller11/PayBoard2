import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
    initialPhone?: string;
    initialEnabled?: boolean;
    onSave: (phone: string, enabled: boolean) => void;
}

export default function WhatsAppConfig({ initialPhone = '', initialEnabled = false, onSave }: Props) {
    const [phone, setPhone] = useState(initialPhone);
    const [enabled, setEnabled] = useState(initialEnabled);
    const [error, setError] = useState('');

    function validatePhone(num: string) {
        // Simple regex for international format
        return /^\+?\d{10,15}$/.test(num);
    }

    function handleSave() {
        if (enabled && !validatePhone(phone)) {
            setError('Ingrese un número válido en formato internacional.');
            return;
        }
        setError('');
        onSave(phone, enabled);
    }

    return (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-2">Alertas por WhatsApp</h2>
            <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
                Activar alertas por WhatsApp
            </label>
            <input
                type="tel"
                className="border rounded px-3 py-2 w-full mb-2"
                placeholder="Ej: +5491123456789"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={!enabled}
            />
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave}>Guardar configuración</button>
        </div>
    );
}
