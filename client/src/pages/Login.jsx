import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const res = await login(email, password);
        setIsLoading(false);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/30 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-900/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-rose-900/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass-panel w-full max-w-md p-8 sm:p-10 rounded-2xl relative z-10 border border-slate-700/50 bg-slate-800/80 backdrop-blur-xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-900/20 mb-4">
                        <Monitor className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-400 mt-2 text-center text-sm">Login to the TMS Lab Management System</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center shadow-sm"
                    >
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-black/50 text-slate-100 placeholder-slate-500 focus:bg-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="student@tms.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-black/50 text-slate-100 placeholder-slate-500 focus:bg-black focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 shadow-lg shadow-indigo-900/20"
                    >
                        {isLoading ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <LogIn className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-400">
                    <p>Demo Accounts:</p>
                    <p className="mt-1"><code className="bg-black px-1.5 py-0.5 rounded border border-slate-700">admin@tms.com</code> | <code className="bg-black px-1.5 py-0.5 rounded border border-slate-700">student@tms.com</code></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
