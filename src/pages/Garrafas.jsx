import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Garrafas() {
    const navigate = useNavigate();
    const [bottles, setBottles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados do formulário
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Vinho');
    const [buyPrice, setBuyPrice] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [stock, setStock] = useState('');

    const fetchBottles = async () => {
        const { data, error } = await supabase.from('bottles').select('*').order('created_at', { ascending: false });
        if (error) console.error(error);
        else setBottles(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchBottles();
    }, []);

    const handleAddBottle = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('bottles').insert([
            {
                name,
                category,
                buy_price: Number(buyPrice),
                sell_price: Number(sellPrice),
                stock_quantity: Number(stock),
            },
        ]);

        if (error) {
            alert("Erro ao adicionar: " + error.message);
        } else {
            alert("Garrafa adicionada com sucesso!");
            setName(''); setBuyPrice(''); setSellPrice(''); setStock('');
            fetchBottles();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Tem a certeza que quer apagar?")) return;
        const { error } = await supabase.from('bottles').delete().eq('id', id);
        if (error) alert("Erro ao apagar: " + error.message);
        else fetchBottles();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/dashboard')} className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Gestão de Garrafas (Stock)</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FORMULÁRIO */}
                <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" /> Nova Garrafa
                    </h2>
                    <form onSubmit={handleAddBottle} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Nome da Garrafa</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option>Vinho</option>
                                <option>Cerveja</option>
                                <option>Whisky</option>
                                <option>Vodka</option>
                                <option>Outro</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Preço Compra (MZN)</label>
                                <input type="number" required value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Preço Venda (MZN)</label>
                                <input type="number" required value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="w-full p-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Quantidade em Stock</label>
                            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border rounded-lg" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
                            Adicionar Garrafa
                        </button>
                    </form>
                </div>

                {/* LISTA */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Garrafas em Stock</h2>
                    {loading ? <p>A carregar...</p> : bottles.length === 0 ? <p className="text-gray-500">Nenhuma garrafa registada.</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-gray-500 text-sm">
                                        <th className="pb-3">Nome</th>
                                        <th className="pb-3">Categoria</th>
                                        <th className="pb-3">Preço Venda</th>
                                        <th className="pb-3">Stock</th>
                                        <th className="pb-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bottles.map((b) => (
                                        <tr key={b.id} className="border-b last:border-0">
                                            <td className="py-3 font-semibold text-gray-700">{b.name}</td>
                                            <td className="py-3 text-gray-600">{b.category}</td>
                                            <td className="py-3 text-green-600 font-bold">{Number(b.sell_price).toFixed(2)} MZN</td>
                                            <td className="py-3">{b.stock_quantity} un.</td>
                                            <td className="py-3 text-right">
                                                <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700 p-2">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}