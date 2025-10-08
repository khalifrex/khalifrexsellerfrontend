"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateCartCount } = useCart();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get transaction details from URL
      const transactionId = searchParams.get('transaction_id');
      const txRef = searchParams.get('tx_ref');
      const status = searchParams.get('status');

      if (!transactionId && !txRef) {
        setStatus('failed');
        setMessage('Payment reference not found');
        return;
      }

      // Check if this is an order payment or subscription
      const pendingOrderId = sessionStorage.getItem('pendingOrderId');
      const orderReference = sessionStorage.getItem('orderReference');

      if (pendingOrderId && orderReference) {
        // Order payment verification
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/webhook/verify-payment`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ transaction_id: transactionId || txRef })
          }
        );

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
          setOrderDetails(data.order);
          
          // Clear cart
          updateCartCount(0);
          
          // Clear session storage
          sessionStorage.removeItem('pendingOrderId');
          sessionStorage.removeItem('orderReference');
          
          // Redirect to order confirmation after 3 seconds
          setTimeout(() => {
            router.push(`/orders/confirmation?orderId=${pendingOrderId}`);
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment verification failed');
        }
      } else {
        // Subscription payment - should be handled by become-seller page
        setStatus('success');
        setMessage('Payment successful! Processing your subscription...');
        
        setTimeout(() => {
          router.push('/become-seller');
        }, 2000);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Failed to verify payment. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {status === 'verifying' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-center mb-6">{message}</p>
              
              {orderDetails && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-semibold text-gray-900">{orderDetails.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-gray-900">
                      ${orderDetails.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="font-semibold text-green-600">Confirmed</span>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                Redirecting automatically...
              </div>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-center mb-6">{message}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Return to Cart
                </button>
                <button
                  onClick={() => router.push('/dashboard/buyer')}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Go to Dashboard
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 text-center">
                  If you were charged but the payment failed, please contact our support team with your transaction reference.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}