import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CashGive() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    const notes = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

    const addNote = (value) => setAmount(amount + value);
    const clear = () => setAmount(0);

    const enviarPedido = async () => {
        if (amount <= 0) return alert("Insira um valor válido.");
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Envia uma notificação para o Administrador
            const { error } = await supabase.from('notifications').insert([
                {
                    sender_id: user.id,
                    amount: amount,
                    status: 'pending',
                },
            ]);

            if (error) throw error;

            alert(`Pedido de ${amount.toFixed(2)} MZN enviado ao Administrador!`);
            setAmount(0);
        } catch (error) {
            alert("Erro ao enviar pedido: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/historico')} className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">CashGive (Transferir)</h1>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm max-w-md mx-auto">
                <h2 className="text-lg font-bold mb-4 text-center">Calculadora de Notas</h2>

                {/* VISOR */}
                <div className="bg-gray-100 p-4 rounded-lg mb-6 text-right text-3xl font-bold text-gray-800">
                    {amount.toFixed(2)} MZN
                </div>

                {/* BOTÕES DE NOTAS */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {notes.map((note) => (
                        <button key={note} onClick={() => addNote(note)} className="bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
                            +{note}
                        </button>
                    ))}
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex gap-2">
                    <button onClick={clear} className="w-1/3 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300">
                        Limpar
                    </button>
                    <button onClick={enviarPedido} disabled={loading} className="w-2/3 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2">
                        <Send className="w-5 h-5" /> {loading ? 'A enviar...' : 'Enviar Pedido'}
                    </button>
                </div>
            </div>
        </div>
    );
}