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
  const [activeTab, setActiveTab] = useState('all');
  const [shippingModal, setShippingModal] = useState({ isOpen: false, orderId: null, trackingNumber: '' });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    document.title = 'Orders | Scent Siphon Admin';
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/orders?page=${page}&limit=20&status=${activeTab}`);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
  };

  const handleMarkShipped = async (orderId, trackingNumber) => {
    setActionLoading(orderId);
    try {
      await axios.patch('/api/orders', {
        orderId,
        action: 'mark_shipped',
        trackingNumber: trackingNumber || undefined
      });
      setShippingModal({ isOpen: false, orderId: null, trackingNumber: '' });
      fetchOrders(pagination.page);
    } catch (error) {
      console.error('Failed to mark as shipped:', error);
      alert('Failed to mark order as shipped. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    setActionLoading(orderId);
    try {
      await axios.patch('/api/orders', {
        orderId,
        action: 'mark_delivered'
      });
      fetchOrders(pagination.page);
    } catch (error) {
      console.error('Failed to mark as delivered:', error);
      alert('Failed to mark order as delivered. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const openShippingModal = (orderId) => {
    setShippingModal({ isOpen: true, orderId, trackingNumber: '' });
  };

  const closeShippingModal = () => {
    setShippingModal({ isOpen: false, orderId: null, trackingNumber: '' });
  };

  return (
    <Layout>
      <h1>Orders</h1>

      {/* Tab Navigation */}
      <div style={{ marginTop: '20px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending', label: 'Pending Payment' },
            { key: 'paid', label: 'Ready to Ship' },
            { key: 'shipped', label: 'Shipped' },
            { key: 'delivered', label: 'Delivered' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
                fontWeight: activeTab === tab.key ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '15px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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
              <th>Status</th>
              <th>Recipient</th>
              <th>Products</th>
              <th>Shipping Info</th>
              <th>Actions</th>
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
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{
                    fontWeight: 'bold',
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85em',
                    backgroundColor: order.delivered ? '#dcfce7' : order.shipped ? '#dbeafe' : order.paid ? '#fef3c7' : '#fee2e2',
                    color: order.delivered ? '#16a34a' : order.shipped ? '#1d4ed8' : order.paid ? '#d97706' : '#dc2626'
                  }}>
                    {order.delivered ? 'DELIVERED' : order.shipped ? 'SHIPPED' : order.paid ? 'READY TO SHIP' : 'UNPAID'}
                  </span>
                </div>
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
                {order.shipped ? (
                  <div>
                    <div style={{ fontSize: '0.85em', color: '#1d4ed8', marginBottom: '4px' }}>
                      📦 Shipped
                    </div>
                    {order.shippedAt && (
                      <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '4px' }}>
                        {new Date(order.shippedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    )}
                    {order.trackingNumber && (
                      <div style={{
                        fontSize: '0.8em',
                        color: '#4b5563',
                        fontFamily: 'monospace',
                        marginTop: '4px',
                        padding: '4px 6px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '3px',
                        wordBreak: 'break-all'
                      }}>
                        Tracking: {order.trackingNumber}
                      </div>
                    )}
                    {order.delivered && order.deliveredAt && (
                      <div style={{ fontSize: '0.85em', color: '#16a34a', marginTop: '8px' }}>
                        ✓ Delivered {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                ) : order.paid ? (
                  <div style={{ fontSize: '0.85em', color: '#d97706' }}>
                    Ready to ship
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85em', color: '#9ca3af' }}>
                    Awaiting payment
                  </div>
                )}
              </td>
              <td>
                {order.paid && !order.shipped && (
                  <button
                    onClick={() => openShippingModal(order._id)}
                    disabled={actionLoading === order._id}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: actionLoading === order._id ? 'not-allowed' : 'pointer',
                      fontSize: '0.85em',
                      opacity: actionLoading === order._id ? 0.6 : 1,
                      marginBottom: '4px',
                      width: '100%'
                    }}
                  >
                    {actionLoading === order._id ? 'Processing...' : 'Mark as Shipped'}
                  </button>
                )}
                {order.shipped && !order.delivered && (
                  <button
                    onClick={() => handleMarkDelivered(order._id)}
                    disabled={actionLoading === order._id}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: actionLoading === order._id ? 'not-allowed' : 'pointer',
                      fontSize: '0.85em',
                      opacity: actionLoading === order._id ? 0.6 : 1,
                      width: '100%'
                    }}
                  >
                    {actionLoading === order._id ? 'Processing...' : 'Mark as Delivered'}
                  </button>
                )}
                {order.delivered && (
                  <div style={{ fontSize: '0.85em', color: '#16a34a', textAlign: 'center' }}>
                    ✓ Complete
                  </div>
                )}
                {!order.paid && (
                  <div style={{ fontSize: '0.85em', color: '#9ca3af', textAlign: 'center' }}>
                    -
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

      {/* Shipping Modal */}
      {shippingModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25em' }}>Mark Order as Shipped</h2>
            <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '0.95em' }}>
              Add an optional tracking number for this shipment.
            </p>
            <input
              type="text"
              placeholder="Tracking Number (optional)"
              value={shippingModal.trackingNumber}
              onChange={(e) => setShippingModal({ ...shippingModal, trackingNumber: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.95em',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeShippingModal}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9em',
                  opacity: actionLoading ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkShipped(shippingModal.orderId, shippingModal.trackingNumber)}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9em',
                  opacity: actionLoading ? 0.6 : 1
                }}
              >
                {actionLoading ? 'Processing...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}