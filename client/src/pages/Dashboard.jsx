import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, CheckCircle, Wrench, Calendar, Monitor, FileText, Activity, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import LabMap from '../components/LabMap';
const usageData = [
    { name: 'Mon', usage: 120 },
    { name: 'Tue', usage: 150 },
    { name: 'Wed', usage: 180 },
    { name: 'Thu', usage: 140 },
    { name: 'Fri', usage: 200 },
    { name: 'Sat', usage: 60 },
    { name: 'Sun', usage: 40 },
];

const parseDBDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr.includes(' ') ? dateStr.replace(' ', 'T') + 'Z' : dateStr);
};

const formatDuration = (start, end) => {
    if (!end) return '-';
    // Simplified duration
    const diff = Math.floor((parseDBDate(end) - parseDBDate(start)) / 1000 / 60);
    return `${diff} mins`;
};

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="glass-panel p-6 rounded-2xl flex items-center justify-between border-slate-700/50"
    >
        <div>
            <p className="text-sm font-semibold text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
        </div>
        <div className={`p-4 rounded-full ${colorClass} bg-opacity-20`}>
            <Icon className="w-6 h-6 text-current" />
        </div>
    </motion.div>
);

const Dashboard = () => {
    const { token } = useContext(AuthContext);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, activePCs: 0 });
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [usageLogs, setUsageLogs] = useState([]);
    const [allUsageLogs, setAllUsageLogs] = useState([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            try {
                const config = { headers: { 'x-auth-token': token } };
                const [ticketsRes, maintRes, usageRes] = await Promise.all([
                    axios.get('/api/tickets', config),
                    axios.get('/api/maintenance', config),
                    axios.get('/api/usage/logs', config)
                ]);

                const tickets = ticketsRes.data;
                const total = tickets.length;
                const pending = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
                const resolved = tickets.filter(t => t.status === 'resolved').length;

                const logs = usageRes.data;
                const activePCs = logs.filter(l => !l.logout_time).length;

                setStats({ total, pending, resolved, activePCs });
                setMaintenanceLogs(maintRes.data.slice(0, 4));
                setUsageLogs(logs.slice(0, 5));
                setAllUsageLogs(logs);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-6"
        >
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight">System Overview</h2>
                    <p className="text-slate-400 mt-1">Real-time metrics and laboratory status.</p>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="TOTAL TICKETS"
                    value={isLoading ? '-' : stats.total}
                    icon={Ticket}
                    colorClass="text-blue-400 bg-blue-500/10"
                    delay={0.1}
                />
                <StatCard
                    title="PENDING FAULTS"
                    value={isLoading ? '-' : stats.pending}
                    icon={Wrench}
                    colorClass="text-amber-400 bg-amber-500/10"
                    delay={0.2}
                />
                <StatCard
                    title="RESOLVED"
                    value={isLoading ? '-' : stats.resolved}
                    icon={CheckCircle}
                    colorClass="text-emerald-400 bg-emerald-500/10"
                    delay={0.3}
                />
                <StatCard
                    title="ACTIVE PCs (NOW)"
                    value={isLoading ? '-' : stats.activePCs}
                    icon={Activity}
                    colorClass="text-rose-400 bg-rose-500/10 border border-rose-500/20"
                    delay={0.4}
                />
            </div>

            {/* Interactive Lab Digital Twin Map */}
            <div className="mt-6">
                <LabMap activeToken={token} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel border-slate-700/50 p-6 rounded-2xl lg:col-span-2"
                >
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-100">Weekly PC Usage</h3>
                        <p className="text-sm text-slate-400">Number of logins across all labs</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={usageData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="usage"
                                    stroke="#fb7185"
                                    strokeWidth={4}
                                    dot={{ r: 4, strokeWidth: 2, stroke: '#1e293b' }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#e11d48' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Maintenance Schedule widget */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-panel border-slate-700/50 p-6 rounded-2xl flex flex-col"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-5 h-5 text-rose-500" />
                        <h3 className="text-lg font-bold text-slate-100">Upcoming Maintenance</h3>
                    </div>

                    <div className="flex-1 space-y-4">
                        {maintenanceLogs.length === 0 ? <p className="text-slate-500 text-sm italic">No upcoming maintenance.</p> :
                            maintenanceLogs.map((item) => (
                                <div key={item.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-slate-200 text-sm line-clamp-1">{item.description}</h4>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <Monitor className="w-3 h-3" /> {item.pc_number}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                                            {format(parseDBDate(item.scheduled_date), 'MMM dd')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>

                    <button
                        onClick={() => navigate('/maintenance')}
                        className="mt-6 w-full py-2.5 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                        View Full Schedule
                    </button>
                </motion.div>
            </div>

            {/* PC Usage Logs Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-panel border-slate-700/50 p-6 rounded-2xl mt-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-rose-500" />
                    <h3 className="text-lg font-bold text-slate-100">Recent PC Usage Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Workstation</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-in Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-out Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {usageLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                                        {log.user_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        <span className="bg-slate-800 text-rose-400 px-2.5 py-1 rounded-md border border-slate-700">{log.computer_id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {format(parseDBDate(log.login_time), 'hh:mm a')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {!log.logout_time ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Active Now
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">{format(parseDBDate(log.logout_time), 'hh:mm a')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                        {formatDuration(log.login_time, log.logout_time)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {usageLogs.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No recent usage logs.</p>}

                    {usageLogs.length > 0 && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setShowLogModal(true)}
                                className="px-6 py-2 text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors"
                            >
                                View Full Log
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Full Logs Modal */}
            <AnimatePresence>
                {showLogModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-rose-500" />
                                    Complete PC Usage Logs
                                </h3>
                                <button
                                    onClick={() => setShowLogModal(false)}
                                    className="p-2 -mr-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="overflow-auto bg-slate-900/50 p-6 flex-grow">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800/80 border-b border-slate-700">
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Workstation</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-in Time</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-out Time</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {allUsageLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                                                    {log.user_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                    <span className="bg-slate-800 text-rose-400 px-2.5 py-1 rounded-md border border-slate-700">{log.computer_id}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                                    {format(parseDBDate(log.login_time), 'MMM dd, yyyy hh:mm a')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {!log.logout_time ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            Active Now
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">{format(parseDBDate(log.logout_time), 'hh:mm a')}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                    {formatDuration(log.login_time, log.logout_time)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/80 flex justify-end">
                                <button
                                    onClick={() => setShowLogModal(false)}
                                    className="px-5 py-2 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                                >
                                    Close Logs
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Dashboard;
