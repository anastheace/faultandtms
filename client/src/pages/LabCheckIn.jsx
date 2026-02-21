import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { MonitorPlay, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

const LabCheckIn = () => {
    const { token, user } = useContext(AuthContext);
    const [pcNumber, setPcNumber] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action) => {
        if (!pcNumber.trim()) {
            setStatus({ type: 'error', message: 'Please enter a PC Number.' });
            return;
        }

        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const config = {
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
            };
            const body = { pcNumber };

            const endpoint = action === 'login' ? '/api/usage/login' : '/api/usage/logout';
            const res = await axios.post(`http://localhost:5000${endpoint}`, body, config);

            setStatus({
                type: 'success',
                message: `Successfully ${action === 'login' ? 'checked in to' : 'checked out of'} ${pcNumber}.`
            });
            if (action === 'logout') setPcNumber('');
        } catch (error) {
            console.error(`Error during ${action}:`, error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || `Failed to ${action}. Please try again.`
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto"
        >
            <div className="glass-panel p-8 sm:p-10 rounded-2xl relative overflow-hidden mt-12">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>

                <div className="relative z-10 flex items-start gap-5 mb-8">
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-900/20 shrink-0">
                        <MonitorPlay className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Lab Check-in</h2>
                        <p className="text-slate-400 mt-1">Log your PC usage time in the laboratory.</p>
                    </div>
                </div>

                {status.message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                            } border`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                        <p className="font-medium text-sm text-slate-200">{status.message}</p>
                    </motion.div>
                )}

                <div className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">PC Number / Workstation ID</label>
                        <input
                            type="text"
                            value={pcNumber}
                            onChange={(e) => setPcNumber(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-xl text-center uppercase tracking-wider text-slate-100 placeholder-slate-600"
                            placeholder="LAB-A-PC01"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={() => handleAction('login')}
                            disabled={isLoading}
                            className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70 shadow-lg shadow-emerald-900/20"
                        >
                            <LogIn className="w-6 h-6" />
                            <span>Check In</span>
                        </button>
                        <button
                            onClick={() => handleAction('logout')}
                            disabled={isLoading}
                            className="flex flex-col items-center justify-center gap-2 bg-slate-800 border-2 border-slate-700 text-slate-300 font-semibold py-4 rounded-xl hover:bg-slate-700 hover:border-slate-600 transition-colors disabled:opacity-70 shadow-sm"
                        >
                            <LogOut className="w-6 h-6" />
                            <span>Check Out</span>
                        </button>
                    </div>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        Logging activity for: <strong className="font-medium text-slate-400">{user?.name}</strong>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default LabCheckIn;
