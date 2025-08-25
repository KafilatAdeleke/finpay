
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TwoFactorAuth from './pages/TwoFactorAuth';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import CreateWallet from './pages/CreateWallet';
import Transfer from './pages/Transfer';
import SendMoney from './pages/SendMoney';
import Transactions from './pages/Transactions';
import Cards from './pages/Cards';
import CreateCard from './pages/CreateCard';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/2fa" element={<TwoFactorAuth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallets"
          element={
            <ProtectedRoute>
              <Layout>
                <Wallets />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallets/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateWallet />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ProtectedRoute>
              <Layout>
                <Transfer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/send"
          element={
            <ProtectedRoute>
              <Layout>
                <SendMoney />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <Layout>
                <Cards />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cards/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateCard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Layout>
                <Invoices />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateInvoice />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;