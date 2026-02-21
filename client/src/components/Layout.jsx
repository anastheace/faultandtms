import { useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Scissors, ClipboardList, LogOut, User, MonitorPlay, Wrench, Ticket, Menu, X } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = {
        admin: [
            { to: '/admin', icon: <ClipboardList className="w-4 h-4" />, label: 'Dashboard' },
            { to: '/tickets', icon: <Ticket className="w-4 h-4" />, label: 'Tickets' },
            { to: '/maintenance', icon: <Wrench className="w-4 h-4" />, label: 'Maintenance' }
        ],
        technician: [
            { to: '/technician', icon: <Scissors className="w-4 h-4" />, label: 'Tasks' }
        ],
        student: [
            { to: '/checkin', icon: <MonitorPlay className="w-4 h-4" />, label: 'Lab Check-in' },
            { to: '/report', icon: <Monitor className="w-4 h-4" />, label: 'Report Fault' }
        ],
        staff: [
            { to: '/checkin', icon: <MonitorPlay className="w-4 h-4" />, label: 'Lab Check-in' },
            { to: '/report', icon: <Monitor className="w-4 h-4" />, label: 'Report Fault' }
        ]
    };

    const userLinks = user ? navLinks[user.role] || [] : [];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Glassmorphism Navbar for Dark Theme */}
            <nav className="glass-panel sticky top-0 z-50 px-4 md:px-6 py-2 border-b border-white/5 relative">
                <div className="flex justify-between items-center h-16 w-full">
                    <div className="flex items-center gap-4">
                        <img src="/tms_logo.svg" alt="TMS Logo" className="h-16 md:h-20 w-auto object-left object-contain cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md origin-left pl-2" />
                    </div>

                    {user && (
                        <div className="flex items-center gap-6">
                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                                {userLinks.map((link) => (
                                    <NavLink key={link.to} to={link.to} className={({ isActive }) => `flex items-center gap-2 hover:text-rose-400 transition-colors ${isActive ? 'text-rose-400' : ''}`}>
                                        {link.icon} {link.label}
                                    </NavLink>
                                ))}
                            </div>

                            {/* User Profile & Logout (Desktop) */}
                            <div className="hidden md:flex items-center gap-4 border-l pl-6 border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                        <User className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-100 leading-tight">{user.name}</p>
                                        <p className="text-xs text-rose-400/80 capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="group p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors" title="Logout">
                                    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-400 transition-colors" />
                                </button>
                            </div>

                            {/* Mobile Hamburger Menu Button */}
                            <div className="md:hidden flex items-center pr-2">
                                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Navigation Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && user && (
                        <motion.div
                            initial={{ opactiy: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden w-full bg-slate-900/95 backdrop-blur-xl border-t border-white/5 absolute top-[100%] left-0 shadow-2xl overflow-hidden"
                        >
                            <div className="flex flex-col p-4 space-y-4">
                                {/* Profile Area in Mobile Menu */}
                                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                        <User className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                                        <p className="text-xs text-rose-400/80 capitalize">{user.role}</p>
                                    </div>
                                </div>

                                {/* Mobile Links */}
                                <div className="flex flex-col gap-2">
                                    {userLinks.map((link) => (
                                        <NavLink
                                            key={link.to}
                                            to={link.to}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors font-medium ${isActive ? 'bg-rose-500/10 text-rose-400' : 'text-slate-300 hover:bg-slate-800 hover:text-rose-400'}`}
                                        >
                                            {link.icon} {link.label}
                                        </NavLink>
                                    ))}
                                </div>

                                {/* Mobile Logout */}
                                <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 transition-colors font-medium border border-transparent hover:border-rose-500/20 mt-2">
                                    <LogOut className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content Area with global animation container */}
            <motion.main
                className="flex-grow p-4 sm:p-8 md:p-12 w-full max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Outlet />
            </motion.main>
        </div>
    );
};

export default Layout;
