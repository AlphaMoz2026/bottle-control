import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, TrendingUp, DollarSign, Package, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Relatorios() {
    const navigate = useNavigate();

    // Definir datas iniciais (Hoje)
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    // Totais
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);

    const fetchReport = async () => {
        setLoading(true);
        try {
            // Vai buscar vendas entre as datas selecionadas (inclui o dia todo até 23:59)
            const { data, error } = await supabase
                .from('sales')
                .select(`
          id,
          quantity,
          total_price,
          created_at,
          bottles (name, buy_price)
        `)
                .gte('created_at', `${startDate}T00:00:00`)
                .lte('created_at', `${endDate}T23:59:59`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setSales(data);

            // Calcular totais
            let revenue = 0;
            let items = 0;
            let profit = 0;

            data.forEach(sale => {
                revenue += Number(sale.total_price);
                items += Number(sale.quantity);

                // Lucro = (Preço Venda - Preço Compra) * Quantidade
                if (sale.bottles && sale.bottles.buy_price) {
                    const itemProfit = (Number(sale.total_price) / Number(sale.quantity)) - Number(sale.bottles.buy_price);
                    profit += itemProfit * Number(sale.quantity);
                }
            });

            setTotalRevenue(revenue);
            setTotalItems(items);
            setTotalProfit(profit);

        } catch (error) {
            alert("Erro ao carregar relatório: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [startDate, endDate]);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Relatórios Avançados</h1>
                </div>

                {/* FILTROS DE DATA */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 text-sm border-none outline-none bg-transparent" />
                    <span className="text-gray-400">até</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 text-sm border-none outline-none bg-transparent" />
                </div>
            </header>

            {/* CARTÕES DE RESUMO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600"><DollarSign className="w-5 h-5" /></div>
                        <h2 className="text-sm font-semibold text-gray-600">Faturação Total</h2>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{totalRevenue.toFixed(2)} MZN</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><TrendingUp className="w-5 h-5" /></div>
                        <h2 className="text-sm font-semibold text-gray-600">Lucro Estimado</h2>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{totalProfit.toFixed(2)} MZN</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Package className="w-5 h-5" /></div>
                        <h2 className="text-sm font-semibold text-gray-600">Produtos Vendidos</h2>
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{totalItems} un.</p>
                </div>
            </div>

            {/* TABELA DETALHADA */}
            <div className="bg-white p-6 rounded-xl shadow-sm max-w-5xl mx-auto">
                <h2 className="text-lg font-bold mb-4">Detalhes das Vendas</h2>

                {loading ? (
                    <p>A carregar...</p>
                ) : sales.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma venda neste período.</p>
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