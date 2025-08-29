import { useState } from "react";

export default function BillingModal({ setBillingModalOpen }) {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50">
        {/* Modal content */}
        <div className="fixed inset-x-0 top-8 bottom-0 bg-white rounded-t-lg shadow-lg p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Billing Details</h3>
            <button
              onClick={() => setBillingModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <button className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Payment Method
          </button>

          <div>
            <button
              onClick={() => setSummaryOpen(true)}
              className="text-blue-600 underline"
            >
              View Summary
            </button>
          </div>
        </div>
      </div>

      {summaryOpen && (
        <BillingSummaryModal setSummaryOpen={setSummaryOpen} />
      )}
    </>
  );
}

function BillingSummaryModal({ setSummaryOpen }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-lg rounded shadow p-6 relative">
        <button
          onClick={() => setSummaryOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h4 className="text-xl font-semibold mb-4">Billing Summary</h4>
        <ul className="space-y-2">
          {["June", "May", "April"].map((month) => (
            <li key={month} className="flex justify-between">
              <span>{month} 2025</span>
              <span>$49.00</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setSummaryOpen(false)}
            className="px-4 py-2 border rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
