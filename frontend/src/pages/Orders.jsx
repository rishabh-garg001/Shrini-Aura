import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, ArrowRight, CheckCircle, RotateCcw, XCircle, Download } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../store/cartStore';
import { Spinner, Badge, Button } from '../components/ui';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = { Pending: 'gold', Processing: 'gold', Shipped: 'blue', Delivered: 'green', Cancelled: 'red' };
const STATUS_ICONS = { Pending: '🕐', Processing: '⚙️', Shipped: '🚚', Delivered: '✅', Cancelled: '❌' };

export function Orders() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then(r => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => api.put(`/orders/${id}/cancel`),
    onSuccess: () => { queryClient.invalidateQueries(['my-orders']); toast.success('Order cancelled'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot cancel order'),
  });

  if (isLoading) return <div className=""><Spinner /></div>;

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Account</p>
          <h1 className="font-serif text-3xl font-bold text-[#111111] dark:text-[#f0ece4]">My Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{orders?.length || 0} orders placed</p>
        </div>

        {orders?.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={36} className="text-gold" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#111111] dark:text-[#f0ece4] mb-2">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Your order history will appear here</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-gold text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#b8924f] transition-colors">
              Start Shopping <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order, i) => (
              <motion.div key={order._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gold/30 transition-colors overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#2c2c2e]">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">ORDER</p>
                      <p className="text-sm font-bold text-[#111111] dark:text-[#f0ece4] font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700" />
                    <div className="hidden sm:block">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">DATE</p>
                      <p className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={STATUS_COLORS[order.orderStatus]}>
                      {STATUS_ICONS[order.orderStatus]} {order.orderStatus}
                    </Badge>
                    <span className="font-bold text-lg text-[#111111] dark:text-[#f0ece4]">₹{order.totalPrice}</span>
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {order.orderItems?.slice(0, 4).map((item, j) => (
                      <img key={j} src={item.image || item.product?.images?.[0]?.url} alt={item.name}
                        className="w-12 h-12 object-cover rounded-xl border-2 border-white dark:border-gray-800 shadow-sm" />
                    ))}
                    {order.orderItems?.length > 4 && (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xs font-bold text-gray-500">
                        +{order.orderItems.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Reorder button */}
                    <ReorderButton order={order} />
                    {/* Cancel button */}
                    {['Pending', 'Processing'].includes(order.orderStatus) && (
                      <button onClick={() => { if (confirm('Cancel this order?')) cancelMutation.mutate(order._id); }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                        <XCircle size={13} /> Cancel
                      </button>
                    )}
                    <Link to={`/orders/${order._id}`} className="flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline">
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReorderButton({ order }) {
  const addItem = useCartStore(s => s.addItem);
  const navigate = useNavigate();

  const handleReorder = async () => {
    try {
      for (const item of order.orderItems) {
        const productId = item.product?._id || item.product;
        const { data: product } = await api.get(`/products/${productId}`);
        addItem(product, item.quantity);
      }
      toast.success('Items added to cart!');
      navigate('/cart');
    } catch { toast.error('Some items may no longer be available'); }
  };

  return (
    <button onClick={handleReorder}
      className="flex items-center gap-1.5 text-xs font-semibold text-gold border border-gold/30 px-3 py-1.5 rounded-full hover:bg-gold/10 transition-all">
      <RotateCcw size={13} /> Reorder
    </button>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/cancel`),
    onSuccess: () => { queryClient.invalidateQueries(['order', id]); toast.success('Order cancelled'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot cancel'),
  });

  const downloadInvoice = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const gold = [201, 169, 110];

    // Header
    doc.setFillColor(...gold);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ShriniAura Candles', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Handmade Scented Candles', 14, 25);

    // Invoice title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 160, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${order._id.slice(-8).toUpperCase()}`, 160, 25);

    // Order info
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 14, 45);
    doc.text(`Customer: ${order.user?.name || 'N/A'}`, 14, 52);
    doc.text(`Email: ${order.user?.email || 'N/A'}`, 14, 59);
    doc.text(`Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}`, 14, 66);
    doc.text(`${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 14, 73);

    // Status badge
    doc.setFillColor(...gold);
    doc.roundedRect(150, 42, 46, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(order.orderStatus, 173, 49, { align: 'center' });

    // Table header
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 82, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Item', 16, 88);
    doc.text('Qty', 130, 88);
    doc.text('Price', 150, 88);
    doc.text('Total', 175, 88);

    // Table rows
    doc.setFont('helvetica', 'normal');
    let y = 98;
    order.orderItems.forEach((item, i) => {
      if (i % 2 === 0) { doc.setFillColor(252, 252, 252); doc.rect(14, y - 5, 182, 8, 'F'); }
      doc.text(item.name.substring(0, 40), 16, y);
      doc.text(String(item.quantity), 132, y);
      doc.text(`Rs.${item.price}`, 150, y);
      doc.text(`Rs.${item.price * item.quantity}`, 175, y);
      y += 10;
    });

    // Totals
    y += 5;
    doc.setDrawColor(...gold);
    doc.line(14, y, 196, y);
    y += 8;
    doc.setFontSize(9);
    const totals = [
      ['Subtotal', `Rs.${order.itemsPrice}`],
      ...(order.discount > 0 ? [[`Coupon (${order.couponCode})`, `-Rs.${order.discount}`]] : []),
      ['Shipping', order.shippingPrice === 0 ? 'Free' : `Rs.${order.shippingPrice}`],
      ['GST (18%)', `Rs.${order.taxPrice}`],
    ];
    totals.forEach(([label, value]) => {
      doc.text(label, 140, y);
      doc.text(value, 196, y, { align: 'right' });
      y += 7;
    });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL', 140, y + 2);
    doc.setTextColor(...gold);
    doc.text(`Rs.${order.totalPrice}`, 196, y + 2, { align: 'right' });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for shopping with ShriniAura Candles!', 105, 280, { align: 'center' });
    doc.text('hello@shriniaura.com | +91 98765 43210', 105, 285, { align: 'center' });

    doc.save(`ShriniAura-Invoice-${order._id.slice(-8).toUpperCase()}.pdf`);
    toast.success('Invoice downloaded!');
  };

  if (isLoading) return <div className=""><Spinner /></div>;
  if (!order) return <div className=" text-center text-[#111111] dark:text-[#f0ece4]">Order not found</div>;

  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStep = steps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0a0a0a] ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Order Details</p>
            <h1 className="font-serif text-3xl font-bold text-[#111111] dark:text-[#f0ece4]">
              #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={STATUS_COLORS[order.orderStatus]}>
              {STATUS_ICONS[order.orderStatus]} {order.orderStatus}
            </Badge>
            {order.isPaid && (
              <button onClick={downloadInvoice}
                className="flex items-center gap-1.5 text-xs font-semibold text-gold border border-gold/30 px-3 py-1.5 rounded-full hover:bg-gold/10 transition-all">
                <Download size={13} /> Invoice
              </button>
            )}
            {['Pending', 'Processing'].includes(order.orderStatus) && (
              <button onClick={() => { if (confirm('Cancel this order?')) cancelMutation.mutate(); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <XCircle size={13} /> Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        {order.orderStatus !== 'Cancelled' && (
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 mb-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-sm text-[#111111] dark:text-[#f0ece4] mb-6 uppercase tracking-wider">Order Progress</h2>
            <div className="relative flex items-center justify-between">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
              <div className="absolute top-5 left-0 h-0.5 bg-gold transition-all duration-700"
                style={{ width: currentStep >= 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%' }} />
              {steps.map((step, i) => (
                <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    i < currentStep ? 'bg-gold border-gold text-white' :
                    i === currentStep ? 'bg-gold border-gold text-white shadow-lg shadow-gold/30' :
                    'bg-white dark:bg-[#1c1c1e] border-gray-200 dark:border-gray-700 text-gray-400'
                  }`}>
                    {i < currentStep ? <CheckCircle size={18} /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold ${i <= currentStep ? 'text-gold' : 'text-gray-400 dark:text-gray-500'}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-5">
              <Package size={16} className="text-gold" />
              <h2 className="font-bold text-[#111111] dark:text-[#f0ece4]">Items Ordered</h2>
            </div>
            <div className="space-y-4">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111] dark:text-[#f0ece4] line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <span className="font-bold text-sm text-[#111111] dark:text-[#f0ece4]">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-gray-100 dark:border-gray-700 mt-5 pt-4 space-y-2 text-sm">
              {[
                { label: 'Subtotal', value: `₹${order.itemsPrice}` },
                ...(order.discount > 0 ? [{ label: `Coupon (${order.couponCode})`, value: `-₹${order.discount}`, green: true }] : []),
                { label: 'Shipping', value: order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}` },
                { label: 'GST', value: `₹${order.taxPrice}` },
              ].map(({ label, value, green }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className={`font-semibold ${green ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#111111] dark:text-[#f0ece4]'}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2 border-t-2 border-gray-100 dark:border-gray-700">
                <span className="text-[#111111] dark:text-[#f0ece4]">Total</span>
                <span className="text-[#111111] dark:text-[#f0ece4]">₹{order.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-gold" />
                <h2 className="font-bold text-[#111111] dark:text-[#f0ece4]">Shipping Address</h2>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 leading-relaxed">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>Pincode: {order.shippingAddress.pincode}</p>
                <p className="text-gold font-medium">📞 {order.shippingAddress.phone}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={16} className="text-gold" />
                <h2 className="font-bold text-[#111111] dark:text-[#f0ece4]">Payment</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <Badge color={order.isPaid ? 'green' : 'red'}>{order.isPaid ? '✓ Paid' : 'Pending'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Method</span>
                  <span className="font-semibold text-[#111111] dark:text-[#f0ece4]">Razorpay</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tracking</span>
                    <span className="font-mono text-xs text-gold">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
