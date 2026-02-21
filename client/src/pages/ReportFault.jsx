import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle2, Send } from 'lucide-react';

const ReportFault = () => {
    const { token, user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        pcNumber: '',
        issueCategory: 'Hardware',
        description: '',
        priority: 'medium',
    });
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };

            const body = JSON.stringify({
                pcNumber: formData.pcNumber,
                issueCategory: formData.issueCategory,
                priority: formData.priority,
                description: formData.description
            });

            const res = await axios.post('/api/tickets', body, config);

            setSubmitStatus({
                type: 'success',
                message: 'Fault report submitted successfully! Ticket ID: ' + res.data.ticketId
            });
            setFormData({ ...formData, pcNumber: '', description: '' });
        } catch (error) {
            console.error('Error submitting report:', error);
            setSubmitStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to submit report. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="glass-panel p-8 sm:p-10 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>

                <div className="relative z-10 flex items-start gap-5 mb-8">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-2xl shadow-lg shadow-indigo-900/20 shrink-0">
                        <AlertTriangle className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Report Lab Fault</h2>
                        <p className="text-slate-400 mt-1">Submit a ticket for hardware or software issues in the computer labs.</p>
                    </div>
                </div>

                {submitStatus.message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${submitStatus.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                    >
                        {submitStatus.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <p className="font-medium text-sm text-slate-200">{submitStatus.message}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">PC Number / ID</label>
                            <input
                                type="text"
                                name="pcNumber"
                                value={formData.pcNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-100 placeholder-slate-500"
                                placeholder="eg. LAB-A-PC12"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Priority Level</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-medium text-slate-200"
                            >
                                <option value="low">Low (Minor inconvenience)</option>
                                <option value="medium">Medium (Impaired functionality)</option>
                                <option value="high">High (Unable to work)</option>
                                <option value="critical">Critical (Safety/Security risk)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Issue Category</label>
                        <select
                            name="issueCategory"
                            value={formData.issueCategory}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-200"
                            required
                        >
                            <option value="Hardware">Hardware (Monitor, keyboard, mouse, etc.)</option>
                            <option value="Software">Software (Application crash, missing software)</option>
                            <option value="Network">Network (No internet connection)</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Issue Overview</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-medium text-slate-100 placeholder-slate-500"
                            placeholder="Please provide details about what happened..."
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 shadow-lg shadow-indigo-900/20 mt-4"
                    >
                        {isSubmitting ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            <>
                                <span>Submit Fault Report</span>
                                <Send className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">
                        Submitting as: <strong className="font-medium text-slate-400">{user?.name}</strong>
                    </p>
                </form>
            </div>
        </motion.div>
    );
};

export default ReportFault;
