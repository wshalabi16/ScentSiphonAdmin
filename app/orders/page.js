"use client";

import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    document.title = 'Orders | Scent Siphon Admin';
    fetchOrders();
  }, []);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/orders?page=${page}&limit=20`);

      // Handle both old format (array) and new format (object with pagination)
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      fetchOrders(page);
    }
  };

  const retryFetch = () => {
    fetchOrders(pagination.page);
  };

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
              <th>Webhook Info</th>
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
                {order.line_items.map((item, index) => {
                  // Handle both new structured format and old Stripe format
                  const brand = item.brand || '';
                  const productTitle = item.productTitle || item.productName || item.price_data?.product_data?.name || '';
                  const quantity = item.quantity;
                  const size = item.size;

                  // If no separate brand field, try to extract from productName
                  let displayBrand = brand;
                  let displayProduct = productTitle;

                  if (!brand && productTitle) {
                    // Fallback: extract brand from product name
                    // Common multi-word brands
                    const knownBrands = ['Christian Dior', 'Tom Ford', 'Yves Saint Laurent', 'Giorgio Armani', 'Jean Paul Gaultier', 'Dolce & Gabbana'];
                    const matchedBrand = knownBrands.find(b => productTitle.startsWith(b + ' '));

                    if (matchedBrand) {
                      displayBrand = matchedBrand;
                      displayProduct = productTitle.substring(matchedBrand.length + 1);
                    } else {
                      const parts = productTitle.split(' ');
                      if (parts.length > 1) {
                        displayBrand = parts[0];
                        displayProduct = parts.slice(1).join(' ');
                      }
                    }
                  }

                  return (
                    <div key={item.productId || item.price_data?.product_data?.metadata?.productId || `item-${order._id}-${index}`} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: index < order.line_items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      {displayBrand && (
                        <div style={{ fontWeight: 'bold', fontSize: '0.95em', color: '#1f2937', marginBottom: '2px' }}>
                          {displayBrand}
                        </div>
                      )}
                      <div style={{ fontSize: '0.9em', color: '#4b5563' }}>
                        {displayProduct} {size && `(${size} ml)`}
                      </div>
                      <div style={{ fontSize: '0.85em', color: '#6b7280', marginTop: '2px' }}>
                        Qty: {quantity}
                      </div>
                    </div>
                  );
                })}
              </td>
              <td>
                {order.paid && order.processedAt ? (
                  <div>
                    <div style={{ fontSize: '0.85em', color: '#059669', marginBottom: '4px' }}>
                      ✓ Processed
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {new Date(order.processedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    {order.stripeEventId && (
                      <div style={{ 
                        fontSize: '0.75em', 
                        color: '#999', 
                        fontFamily: 'monospace',
                        marginTop: '4px',
                        wordBreak: 'break-all'
                      }}>
                        {order.stripeEventId}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85em', color: '#9ca3af' }}>
                    {order.paid ? 'Legacy order' : 'Pending payment'}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}

      {/* Pagination Controls */}
      {!loading && !error && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-default disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
          </span>

          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="btn-default disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
}