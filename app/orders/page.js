"use client";

import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/orders').then(response => {
      setOrders(response.data);
    });
  }, []);

  // Helper function to add "ml" to sizes in product names
  function formatProductName(name) {
    if (!name) return '';
    return name.replace(/\((\d+)\)/g, '($1 ml)');
  }

  return (
    <Layout>
      <h1>Orders</h1>
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
          {orders.length > 0 && orders.map(order => (
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
                  <div key={index} style={{ marginBottom: '4px' }}>
                    {formatProductName(item.price_data?.product_data?.name)} × {item.quantity}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}