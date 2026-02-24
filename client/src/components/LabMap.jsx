import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, AlertTriangle, Monitor, X } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const LabMap = ({ activeToken }) => {
    const [computers, setComputers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [usage, setUsage] = useState([]);
    const [selectedPC, setSelectedPC] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMapData = async () => {
            if (!activeToken) return;
            try {
                const config = { headers: { 'x-auth-token': activeToken } };
                const [compRes, ticketRes, usageRes] = await Promise.all([
                    axios.get('/api/tickets', config), // Re-using ticket endpoint since we don't have a dedicated computer endpoint yet, we'll map from usage/tickets
                    axios.get('/api/tickets', config),
                    axios.get('/api/usage/logs', config)
                ]);

                setTickets(ticketRes.data);
                setUsage(usageRes.data);

                // Mocking full computer list since we need to visualize the whole lab
                const mockComputers = [
                    { id: 1, computer_id: 'LAB-A-01', lab: 'Lab A' },
                    { id: 2, computer_id: 'LAB-A-02', lab: 'Lab A' },
                    { id: 3, computer_id: 'LAB-A-05', lab: 'Lab A' },
                    { id: 4, computer_id: 'LAB-B-01', lab: 'Lab B' },
                    { id: 5, computer_id: 'LAB-B-07', lab: 'Lab B' },
                    { id: 6, computer_id: 'LAB-B-11', lab: 'Lab B' },
                    { id: 7, computer_id: 'LAB-C-04', lab: 'Lab C' },
                    { id: 8, computer_id: 'LAB-C-09', lab: 'Lab C' },
                    { id: 9, computer_id: 'LAB-D-12', lab: 'Lab D' }
                ];
                setComputers(mockComputers);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch map data", err);
                setIsLoading(false);
            }
        };

        fetchMapData();
        // Poll every 10 seconds for real-time map updates
        const interval = setInterval(fetchMapData, 10000);
        return () => clearInterval(interval);
    }, [activeToken]);

    const getPCStatus = (computerId) => {
        const activeFault = tickets.find(t => t.computer_id === computerId && (t.status === 'open' || t.status === 'in_progress'));
        if (activeFault) return { state: 'fault', data: activeFault };

        const activeUsage = usage.find(u => u.computer_id === computerId && !u.logout_time);
        if (activeUsage) return { state: 'in_use', data: activeUsage };

        return { state: 'available', data: null };
    };

    const getStatusStyles = (state) => {
        switch (state) {
            case 'fault': return 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse cursor-pointer';
            case 'in_use': return 'bg-emerald-500/20 border-emerald-500 text-emerald-400 opacity-90';
            case 'available': return 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-slate-500 transition-colors cursor-pointer';
            default: return 'bg-slate-800/50 border-slate-700 text-slate-500';
        }
    };

    // Grouping computers by Lab
    const labs = [...new Set(computers.map(c => c.lab))];

    if (isLoading) return <div className="animate-pulse h-64 bg-slate-800/50 rounded-2xl w-full"></div>;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel border-slate-700/50 p-6 rounded-2xl relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Map className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-100">Interactive Lab Map</h3>
                        <p className="text-sm text-slate-400">Live Digital Twin visualizer</p>
                    </div>
                </div>

                <div className="flex gap-4 text-xs font-medium bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50 hidden sm:flex">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500/50 border border-emerald-500"></span> In Use</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500 animate-pulse"></span> Fault Detected</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600"></span> Available</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {labs.map(labName => (
                    <div key={labName} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                        <h4 className="text-slate-400 font-semibold mb-4 text-sm tracking-wider uppercase">{labName}</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {computers.filter(c => c.lab === labName).map(pc => {
                                const status = getPCStatus(pc.computer_id);
                                return (
                                    <div
                                        key={pc.id}
                                        onClick={() => (status.state === 'fault' || status.state === 'available') && setSelectedPC({ pc, status })}
                                        className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all ${getStatusStyles(status.state)}`}
                                    >
                                        <Monitor className="w-6 h-6 mb-1 opacity-80" />
                                        <span className="text-[10px] font-bold tracking-tight text-center">{pc.computer_id.split('-').pop()}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* PC Detail Modal */}
            <AnimatePresence>
                {selectedPC && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className={`p-4 border-b border-slate-700/50 flex justify-between items-center ${selectedPC.status.state === 'fault' ? 'bg-red-500/10' : 'bg-slate-800'}`}>
                                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    <Monitor className={`w-5 h-5 ${selectedPC.status.state === 'fault' ? 'text-red-400' : 'text-slate-400'}`} />
                                    {selectedPC.pc.computer_id} Details
                                </h3>
                                <button onClick={() => setSelectedPC(null)} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                {selectedPC.status.state === 'fault' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-1">Active Ticket #{selectedPC.status.data.id}</h4>
                                                <p className="text-slate-200 text-sm">{selectedPC.status.data.description}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                                <span className="block text-xs text-slate-500 mb-1">Category</span>
                                                <span className="text-sm font-medium text-slate-300">{selectedPC.status.data.issue_category}</span>
                                            </div>
                                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                                <span className="block text-xs text-slate-500 mb-1">Assigned Tech</span>
                                                <span className="text-sm font-medium text-slate-300">{selectedPC.status.data.assigned_to || 'Pending'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                            <Monitor className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-200 mb-2">Workstation Available</h4>
                                        <p className="text-slate-400 text-sm">This PC is currently operational and ready for deployment.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default LabMap;
