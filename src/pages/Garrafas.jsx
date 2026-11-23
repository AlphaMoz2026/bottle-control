import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, Trash2, Pencil, X } from 'lucide-react';
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

    // Estado para saber se estamos a editar
    const [editingId, setEditingId] = useState(null);

    const fetchBottles = async () => {
        const { data, error } = await supabase.from('bottles').select('*').order('created_at', { ascending: false });
        if (error) console.error(error);
        else setBottles(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchBottles();
    }, []);

    const limparFormulario = () => {
        setName(''); setCategory('Vinho'); setBuyPrice(''); setSellPrice(''); setStock('');
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const produto = {
            name,
            category,
            buy_price: Number(buyPrice),
            sell_price: Number(sellPrice),
            stock_quantity: Number(stock),
        };

        try {
            if (editingId) {
                // MODO DE EDIÇÃO: Atualiza o produto existente
                const { error } = await supabase.from('bottles').update(produto).eq('id', editingId);
                if (error) throw error;
                alert("Produto atualizado com sucesso!");
            } else {
                // MODO DE CRIAÇÃO: Insere um novo produto
                const { error } = await supabase.from('bottles').insert([produto]);
                if (error) throw error;
                alert("Produto adicionado com sucesso!");
            }

            limparFormulario();
            fetchBottles();
        } catch (error) {
            alert("Erro ao guardar: " + error.message);
        }
    };

    const handleEditClick = (bottle) => {
        setName(bottle.name);
        setCategory(bottle.category || 'Outro');
        setBuyPrice(bottle.buy_price);
        setSellPrice(bottle.sell_price);
        setStock(bottle.stock_quantity);
        setEditingId(bottle.id);

        // Faz scroll para o topo para ver o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                <h1 className="text-2xl font-bold text-gray-800">Gestão de Produtos (Stock)</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FORMULÁRIO (Adicionar ou Editar) */}
                <div className={`p-6 rounded-xl shadow-sm h-fit transition-colors ${editingId ? 'bg-blue-50 border border-blue-200' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            {editingId ? <Pencil className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                            {editingId ? 'Editar Produto' : 'Novo Produto'}
                        </h2>
                        {editingId && (
                            <button onClick={limparFormulario} className="text-gray-500 hover:text-red-500">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Nome do Produto</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Categoria</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-lg outline-none">
                                <option>Vinho</option>
                                <option>Cerveja</option>
                                <option>Whisky</option>
                                <option>Vodka</option>
                                <option>Sumo</option>
                                <option>Outro</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Preço Compra (MZN)</label>
                                <input type="number" required value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="w-full p-2 border rounded-lg outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Preço Venda (MZN)</label>
                                <input type="number" required value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="w-full p-2 border rounded-lg outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Quantidade em Stock</label>
                            <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border rounded-lg outline-none" />
                        </div>

                        <div className="flex gap-2">
                            {editingId && (
                                <button type="button" onClick={limparFormulario} className="w-1/3 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50">
                                    Cancelar
                                </button>
                            )}
                            <button type="submit" className={`font-bold py-2 rounded-lg text-white ${editingId ? 'w-2/3 bg-blue-600 hover:bg-blue-700' : 'w-full bg-blue-600 hover:bg-blue-700'}`}>
                                {editingId ? 'Atualizar' : 'Adicionar Produto'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* LISTA DE PRODUTOS */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Produtos em Stock</h2>
                    {loading ? <p>A carregar...</p> : bottles.length === 0 ? <p className="text-gray-500">Nenhum produto registado.</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-gray-500 text-sm">
                                        <th className="pb-3">Nome</th>
                                        <th className="pb-3">Preço Venda</th>
                                        <th className="pb-3">Stock</th>
                                        <th className="pb-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bottles.map((b) => (
                                        <tr key={b.id} className={`border-b last:border-0 ${editingId === b.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                            <td className="py-3 font-semibold text-gray-700">
                                                {b.name} <span className="text-xs font-normal text-gray-400">({b.category})</span>
                                            </td>
                                            <td className="py-3 text-green-600 font-bold">{Number(b.sell_price).toFixed(2)} MZN</td>
                                            <td className="py-3">{b.stock_quantity} un.</td>
                                            <td className="py-3 text-right flex justify-end gap-2">
                                                {/* BOTÃO DE EDITAR */}
                                                <button onClick={() => handleEditClick(b)} className="text-blue-500 hover:text-blue-700 p-1.5 bg-blue-50 rounded-lg">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {/* BOTÃO DE APAGAR */}
                                                <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700 p-1.5 bg-red-50 rounded-lg">
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