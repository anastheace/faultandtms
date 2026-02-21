import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import AuthContext from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TechnicianPanel from './pages/TechnicianPanel';
import ReportFault from './pages/ReportFault';
import LabCheckIn from './pages/LabCheckIn';
import MaintenanceScheduler from './pages/MaintenanceScheduler';
import AdminTickets from './pages/AdminTickets';

function App() {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (!user) return <Navigate to="/login" replace />;
        if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
        return children;
    };

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

                <Route path="/" element={<Layout />}>
                    <Route index element={
                        user ? (
                            user.role === 'admin' ? <Navigate to="/admin" replace /> :
                                user.role === 'technician' ? <Navigate to="/technician" replace /> :
                                    <Navigate to="/checkin" replace />
                        ) : <Navigate to="/login" replace />
                    } />

                    <Route path="admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="tickets" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminTickets />
                        </ProtectedRoute>
                    } />

                    <Route path="maintenance" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <MaintenanceScheduler />
                        </ProtectedRoute>
                    } />

                    <Route path="technician" element={
                        <ProtectedRoute allowedRoles={['technician']}>
                            <TechnicianPanel />
                        </ProtectedRoute>
                    } />

                    <Route path="report" element={
                        <ProtectedRoute allowedRoles={['student', 'staff']}>
                            <ReportFault />
                        </ProtectedRoute>
                    } />

                    <Route path="checkin" element={
                        <ProtectedRoute allowedRoles={['student', 'staff']}>
                            <LabCheckIn />
                        </ProtectedRoute>
                    } />
                </Route>
            </Routes>
        </AnimatePresence>
    );
}

export default App;

