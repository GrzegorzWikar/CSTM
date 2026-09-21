import { Navigate, Route, Routes } from "react-router";
import AppLayout from '../layouts/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import NewTicketPage from '../pages/NewTicketPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProfilePage from '../pages/ProfilePage';
import RegisterPage from '../pages/RegisterPage';
import TicketDetailsPage from '../pages/TicketDetailsPage';
import TicketsPage from '../pages/TicketsPage';

function AppRouter() {
    return(
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/tickets" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/ticket/new" element={<NewTicketPage />} />
                <Route path="/ticket/:id" element={<TicketDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default AppRouter;