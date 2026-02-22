import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Search, AlertTriangle, CheckCircle2, PlayCircle, Clock, Info, X } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

// Technicians are now fetched from the backend

const AdminTickets = () => {
    const { token } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedTicketInfo, setSelectedTicketInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const resTickets = await axios.get('/api/tickets', config);
                const resTechs = await axios.get('/api/auth/technicians', config);
                setTickets(resTickets.data);
                setTechnicians(resTechs.data);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        if (token) fetchData();
    }, [token]);

    const handleAssign = async (ticketId, techId) => {
        try {
            const config = { headers: { 'x-auth-token': token } };
            await axios.put(`/api/tickets/${ticketId}/assign`, { techId: parseInt(techId) }, config);

            const selectedTech = technicians.find(t => t.id === parseInt(techId));

            // Update UI optimistically
            setTickets(tickets.map(t =>
                t.id === ticketId ? { ...t, status: 'in_progress', assignedTo: selectedTech ? selectedTech.name : 'Unknown Tech' } : t
            ));
        } catch (error) {
            console.error("Error assigning ticket", error);
        }
    };

    const filteredTickets = filterStatus === 'all'
        ? tickets
        : tickets.filter(t => t.status === filterStatus);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open':
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" /> Open
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
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Ticket Management</h2>
                    <p className="text-slate-400 mt-1">View reported faults and assign tasks to technicians.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="glass-panel overflow-hidden rounded-2xl border-slate-700/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50 border-b border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reporter / Node</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignee</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredTickets.map((ticket, index) => (
                                <motion.tr
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-rose-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">{ticket.id}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-200">{ticket.user}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600"></span> {ticket.pc}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {ticket.status === 'resolved' ? (
                                            <span className="text-slate-500 font-medium">{ticket.assignedTo}</span>
                                        ) : (
                                            <select
                                                className="w-full text-sm font-medium bg-slate-800 border border-slate-700 text-slate-300 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                                                value={ticket.assignedTo ? technicians.find(t => t.name === ticket.assignedTo)?.id || '' : ''}
                                                onChange={(e) => handleAssign(ticket.id, e.target.value)}
                                            >
                                                <option value="" disabled>Unassigned</option>
                                                {technicians.map(tech => (
                                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredTickets.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <Ticket className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                        <h3 className="text-lg font-medium text-slate-300">No tickets found</h3>
                        <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search query.</p>
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
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reported By</div>
                                        <div className="text-sm font-medium text-slate-200">{selectedTicketInfo.user}</div>
                                    </div>
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
                                    <div>
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</div>
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

export default AdminTickets;
