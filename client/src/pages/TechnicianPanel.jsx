import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, PlayCircle, Clock, Search, Filter, Info, X } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const TechnicianPanel = () => {
    const { token, user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [selectedTicketInfo, setSelectedTicketInfo] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await axios.get('/api/tickets', config);
                const assigned = res.data.filter(t => t.assignedTo === user.name);
                setTickets(assigned);
            } catch (error) {
                console.error("Error fetching assigned tickets", error);
            }
        };
        if (token && user) fetchTickets();
    }, [token, user]);

    const updateStatus = async (id, newStatus) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`/api/tickets/${id}/status`, { status: newStatus }, config);
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Error updating ticket status", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                );
            case 'assigned':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" /> Assigned
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <PlayCircle className="w-3.5 h-3.5" /> In Progress
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                );
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Unknown</span>;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical':
            case 'high': return 'text-red-400 font-bold';
            case 'medium': return 'text-amber-400 font-medium';
            case 'low': return 'text-emerald-400 font-medium';
            default: return 'text-slate-400';
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
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Technician Workspace</h2>
                    <p className="text-slate-400 mt-1">Manage and resolve assigned laboratory fault tickets.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden rounded-2xl border-slate-700/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Station</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue Description</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {tickets.map((ticket, index) => (
                                <motion.tr
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-blue-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md">{ticket.id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">
                                        {ticket.pc}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        <div className="flex items-center justify-between gap-2 max-w-xs">
                                            <span className="truncate">{ticket.issue}</span>
                                            <button
                                                onClick={() => setSelectedTicketInfo(ticket)}
                                                className="flex-shrink-0 text-xs px-2 py-1 bg-slate-700/50 hover:bg-rose-500/20 text-rose-400 border border-slate-600 hover:border-rose-500/30 rounded-md flex items-center gap-1 transition-colors"
                                                title="Issue Overview"
                                            >
                                                <Info className="w-3.5 h-3.5" /> Overview
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                                        <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(ticket.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm block min-w-[150px]">
                                        {(ticket.status === 'open' || ticket.status === 'assigned' || ticket.status === 'pending') && (
                                            <button
                                                onClick={() => updateStatus(ticket.id, 'in_progress')}
                                                className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-medium rounded-lg transition-colors border border-blue-500/20"
                                            >
                                                <PlayCircle className="w-4 h-4" /> Start Work
                                            </button>
                                        )}
                                        {ticket.status === 'in_progress' && (
                                            <button
                                                onClick={() => updateStatus(ticket.id, 'resolved')}
                                                className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-medium rounded-lg transition-colors border border-emerald-500/20"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                                            </button>
                                        )}
                                        {ticket.status === 'resolved' && (
                                            <span className="text-slate-500 italic">Completed</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {tickets.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No tickets currently assigned to you.
                    </div>
                )}
            </div>

            {/* Issue Overview Modal */}
            <AnimatePresence>
                {selectedTicketInfo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-700/50 bg-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-indigo-400" />
                                    Detailed Issue Overview
                                </h3>
                                <button
                                    onClick={() => setSelectedTicketInfo(null)}
                                    className="p-2 -mr-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-grow bg-slate-900/50 max-h-[60vh]">
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">User's Detailed Issue Text</p>
                                        <p className="text-slate-300 bg-slate-800/80 p-4 rounded-xl border border-slate-700/50 leading-relaxed min-h-[100px] shadow-inner text-sm md:text-base whitespace-pre-wrap">
                                            {selectedTicketInfo.description}
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ticket ID</div>
                                        <div className="text-sm font-medium text-rose-400 bg-slate-900 inline-block px-2.5 py-1 rounded-md border border-slate-700">#{selectedTicketInfo.id}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Workstation</div>
                                        <div className="text-sm font-medium text-slate-200">{selectedTicketInfo.pc}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</div>
                                        <div className="text-sm font-medium capitalize flex items-center gap-2">
                                            <span className={getPriorityColor(selectedTicketInfo.priority)}>{selectedTicketInfo.priority}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Status</div>
                                        <div className="mt-1">{getStatusBadge(selectedTicketInfo.status)}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/80 flex justify-end">
                                <button
                                    onClick={() => setSelectedTicketInfo(null)}
                                    className="px-5 py-2 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TechnicianPanel;
