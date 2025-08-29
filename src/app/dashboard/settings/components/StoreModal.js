export default function StoreModal({
  storeForm,
  handleStoreInputChange,
  handleSaveStore,
  setStoreModalOpen,
  sellerInfo,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">Edit Store Information</h3>
        <div className="space-y-4">
          {["storeName", "email"].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              value={storeForm[field]}
              onChange={handleStoreInputChange}
              placeholder={
                field === "storeName"
                  ? "Store Name"
                  : field === "email"
                  ? "Email"
                  : "Phone Number"
              }
              disabled={
                (field === "email" && sellerInfo?.pendingEmail) 
              }
              className="w-full border p-2 rounded bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          ))}
        </div>

        {(sellerInfo?.pendingEmail) && (
          <div className="mt-3 text-sm text-yellow-600">
            {sellerInfo.pendingEmail && (
              <p>
                New email pending verification: {sellerInfo.pendingEmail}
              </p>
            )}
            
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setStoreModalOpen(false)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveStore}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
