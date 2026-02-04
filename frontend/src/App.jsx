import { Routes, Route, NavLink } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import OrderDetail from './pages/OrderDetail';
import NewOrder from './pages/NewOrder';
import CustomerDetail from './pages/CustomerDetail';
import Designs from './pages/Designs';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:customerId" element={<CustomerDetail />} />
        <Route path="/orders" element={<Customers />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/designs" element={<Designs />} />
      </Routes>
    </Layout>
  );
}

export default App;
