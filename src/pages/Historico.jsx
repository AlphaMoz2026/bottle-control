import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Historico() {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            const { data, error } = await supabase
                .from('sales')
                .select(`
          id,
          quantity,
          total_price,
          created_at,
          bottles (name)
        `)
                .order('created_at', { ascending: false });

            if (error) console.error(error);
            else setSales(data);
            setLoading(false);
        };
        fetchSales();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/vendas')} className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 px-4">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                    <span className="text-gray-700 font-semibold">Voltar</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Histórico de Vendas</h1>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm max-w-4xl mx-auto">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gray-600" /> Faturas Emitidas
                </h2>

                {loading ? (
                    <p>A carregar histórico...</p>
                ) : sales.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma venda registada.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-gray-500 text-sm">
                                    <th className="pb-3">Data e Hora</th>
                                    <th className="pb-3">Produto</th>
                                    <th className="pb-3">Qtd</th>
                                    <th className="pb-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-3 text-sm text-gray-600">
                                            {new Date(sale.created_at).toLocaleString('pt-PT')}
                                        </td>
                                        <td className="py-3 font-semibold text-gray-700">
                                            {sale.bottles?.name || 'Produto apagado'}
                                        </td>
                                        <td className="py-3">{sale.quantity} un.</td>
                                        <td className="py-3 text-right font-bold text-green-600">
                                            {Number(sale.total_price).toFixed(2)} MZN
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}