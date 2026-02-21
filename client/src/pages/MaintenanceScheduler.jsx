import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, CheckCircle2, Wrench, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const MaintenanceScheduler = () => {
    const { token } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ pcNumber: '', scheduledDate: '', description: '' });

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('http://localhost:5000/api/maintenance', config);
                setSchedules(res.data);
            } catch (error) {
                console.error("Error fetching schedules", error);
            }
        };
        if (token) fetchSchedules();
    }, [token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post('http://localhost:5000/api/maintenance', formData, config);

            setSchedules([{ ...formData, id: Date.now(), status: 'pending' }, ...schedules]); // Optimistic
            setIsFormOpen(false);
            setFormData({ pcNumber: '', scheduledDate: '', description: '' });

            // Re-fetch to get correct IDs
            const refreshRes = await axios.get('http://localhost:5000/api/maintenance', config);
            setSchedules(refreshRes.data);
        } catch (error) {
            console.error("Error creating schedule", error);
        }
    };

    const handleComplete = async (id) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`http://localhost:5000/api/maintenance/${id}/status`, { status: 'completed' }, config);

            setSchedules(schedules.map(sch =>
                sch.id === id ? { ...sch, status: 'completed' } : sch
            ));
        } catch (error) {
            console.error("Error completing schedule", error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Maintenance Scheduler</h2>
                    <p className="text-slate-400 mt-1">Plan and track preventative hardware and software servicing.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium shadow-md shadow-rose-900/20 hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Schedule Service
                </button>
            </div>

            {/* Schedule Form Modal/Dropdown (Simplified for UI view) */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-panel border-slate-700/50 p-6 rounded-2xl mb-6">
                            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-rose-500" /> New Maintenance Task
                            </h3>
                            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700/50 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Workstation Node</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.pcNumber}
                                        onChange={e => setFormData({ ...formData, pcNumber: e.target.value })}
                                        placeholder="e.g. LAB-A-01"
                                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Scheduled Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.scheduledDate}
                                        onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none placeholder-slate-500 dark:[color-scheme:dark]"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Service Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Briefly describe the required maintenance..."
                                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                    />
                                </div>
                                <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-700 hover:text-slate-300 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-rose-600 text-white text-sm font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-sm"
                                    >
                                        Save Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass-panel overflow-hidden rounded-2xl border-slate-700/50">
                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Find workstation schedule..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Workstation</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Task</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {schedules.map((item, index) => (
                                <motion.tr
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                                        {format(new Date(item.scheduled_date), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-rose-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">{item.computer_id || item.pc_number}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {item.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {item.status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                <Clock className="w-3.5 h-3.5" /> Scheduled
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end">
                                            <AnimatePresence mode="popLayout">
                                                {item.status === 'pending' ? (
                                                    <motion.button
                                                        key="btn-pending"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(16 185 129 / 0.5)" }}
                                                        whileTap={{ scale: 0.9, rotate: -3 }}
                                                        exit={{ opacity: 0, scale: 1.5, filter: "blur(4px)", transition: { duration: 0.3, ease: "easeOut" } }}
                                                        onClick={() => handleComplete(item.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-medium rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" /> Mark Done
                                                    </motion.button>
                                                ) : (
                                                    <motion.span
                                                        key="txt-completed"
                                                        initial={{ opacity: 0, scale: 0, y: 15 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 15, delay: 0.1 } }}
                                                        className="text-emerald-500 font-bold flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" /> Completed!
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default MaintenanceScheduler;
