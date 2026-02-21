import { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Monitor, Scissors, ClipboardList, LogOut, User, MonitorPlay, Wrench, Ticket } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Glassmorphism Navbar for Dark Theme */}
            <nav className="glass-panel sticky top-0 z-50 px-6 py-2 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-4">
                    <img src="/tms_logo.svg" alt="TMS Logo" className="h-20 sm:h-24 w-auto object-left object-contain cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md origin-left pl-2" />
                </div>

                {user && (
                    <div className="flex items-center gap-6">
                        {/* Navigation Links based on role */}
                        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-300">
                            {user.role === 'admin' && (
                                <>
                                    <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-2 hover:text-rose-400 transition-colors ${isActive ? 'text-rose-400' : ''}`}>
                                        <ClipboardList className="w-4 h-4" /> Dashboard
                                    </NavLink>
                                    <NavLink to="/tickets" className={({ isActive }) => `flex items-center gap-2 hover:text-rose-400 transition-colors ${isActive ? 'text-rose-400' : ''}`}>
                                        <Ticket className="w-4 h-4" /> Tickets
                                    </NavLink>
                                    <NavLink to="/maintenance" className={({ isActive }) => `flex items-center gap-2 hover:text-rose-400 transition-colors ${isActive ? 'text-rose-400' : ''}`}>
                                        <Wrench className="w-4 h-4" /> Maintenance
                                    </NavLink>
                                </>
                            )}
                            {user.role === 'technician' && (
                                <NavLink to="/technician" className={({ isActive }) => `flex items-center gap-2 hover:text-rose-400 transition-colors ${isActive ? 'text-rose-400' : ''}`}>
                                    <Scissors className="w-4 h-4" /> Tasks
                                </NavLink>
                            )}
                            {['student', 'staff'].includes(user.role) && (
                                <>
                                    <NavLink to="/checkin" className={({ isActive }) => `flex items-center gap-2 hover:text-rose-400 transition-colors ${isActive ? 'text-rose-400' : ''}`}>
                                        <MonitorPlay className="w-4 h-4" /> Lab Check-in
                                    </NavLink>
                                    <NavLink to="/report" className={({ isActive }) => `flex items-center gap-2 hover:text-rose-400 transition-colors ${isActive ? 'text-rose-400' : ''}`}>
                                        <Monitor className="w-4 h-4" /> Report Fault
                                    </NavLink>
                                </>
                            )}
                        </div>

                        {/* User Profile & Logout */}
                        <div className="flex items-center gap-4 border-l pl-6 border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    <User className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-100 leading-tight">{user.name}</p>
                                    <p className="text-xs text-rose-400/80 capitalize">{user.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="group p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-400 transition-colors" />
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content Area with global animation container */}
            <motion.main
                className="flex-grow p-6 sm:p-8 md:p-12 w-full max-w-7xl mx-auto"
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
