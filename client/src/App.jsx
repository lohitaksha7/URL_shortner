import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import GlobalAnalytics from './pages/GlobalAnalytics'
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggleFloating from './components/ThemeToggleFloating';

function App(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path= "/" element={<Home />}/>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute> <Dashboard /> </ProtectedRoute>} />
                <Route path="/analytics/global" element={<ProtectedRoute> <GlobalAnalytics /> </ProtectedRoute>} />
                <Route path="/analytics/:code" element={<Analytics />} />
{/*                 <Route path="/dashboard" element = {<Dashboard />}> */}
            </Routes>
            <ThemeToggleFloating />
        </BrowserRouter>
    );
}

export default App