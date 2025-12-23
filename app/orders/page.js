"use client";

import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Orders | Scent Siphon Admin';

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    axios.get('/api/orders')
      .then(response => setOrders(response.data))
      .catch(err => setError('Failed to load orders. Please try again.'))
      .finally(() => setLoading(false));
  };

  // Helper function to add "ml" to sizes in product names
  function formatProductName(name) {
    if (!name) return '';
    return name.replace(/\((\d+)\)/g, '($1 ml)');
  }

  return (
    <Layout>
      <h1>Orders</h1>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Spinner />
          <span className="ml-2">Loading orders...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded p-4 my-4">
          <p className="text-red-800">{error}</p>
          <button onClick={retryFetch} className="btn-default mt-2">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No orders yet.</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && orders.length > 0 && (
        <table className="basic">
          <thead>
            <tr>
              <th>Date</th>
              <th>Paid</th>
              <th>Recipient</th>
              <th>Products</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
            <tr key={order._id}>
              <td>
                {(new Date(order.createdAt)).toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </td>
              <td className={order.paid ? 'text-green-600' : 'text-red-600'}>
                <span style={{ 
                  fontWeight: 'bold',
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: order.paid ? '#dcfce7' : '#fee2e2',
                  color: order.paid ? '#16a34a' : '#dc2626'
                }}>
                  {order.paid ? 'PAID' : 'UNPAID'}
                </span>
              </td>
              <td>
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ fontSize: '1.05em' }}>{order.name}</strong>
                </div>
                <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                  {order.email}
                </div>
                <div style={{ fontSize: '0.95em', color: '#333', lineHeight: '1.6' }}>
                  {order.streetAddress}<br />
                  {order.city}, {order.province}, {order.postalCode}<br />
                </div>
              </td>
              <td>
                {order.line_items.map((item, index) => (
                  <div key={item.price_data?.product_data?.metadata?.productId || `item-${order._id}-${index}`} style={{ marginBottom: '4px' }}>
                    {formatProductName(item.price_data?.product_data?.name)} × {item.quantity}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </Layout>
  );
}