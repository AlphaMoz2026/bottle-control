import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Utilizadores() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Cria o utilizador no Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name, role: 'cashier' },
                },
            });

            if (error) throw error;

            alert(`Cashier ${name} criado com sucesso!`);
            setEmail(''); setPassword(''); setName('');
        } catch (error) {
            alert("Erro ao criar utilizador: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/dashboard')} className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Gestão de Utilizadores</h1>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm max-w-md mx-auto">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" /> Criar Novo Cashier
                </h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Nome do Funcionário</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Senha (mín. 6 caracteres)</label>
                        <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded-lg" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
                        {loading ? 'A criar...' : 'Criar Cashier'}
                    </button>
                </form>
            </div>
        </div>
    );
}