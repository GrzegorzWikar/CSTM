import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './routes/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketListPage from './pages/TicketListPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import UserPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<TicketListPage />} />
            <Route path='/tickets/new' element={<CreateTicketPage />}/>
            <Route path='/tickets/:id' element={<TicketDetailsPage />} />
            <Route element={<PrivateRoute allowedRoles={['Support', 'Admin']} />}>
              <Route path='/users' element={<UserPage/>} />
            </Route>
          </Route>
          <Route path='*' element={<NotFoundPage />}/> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;