"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreImageModal({ setModalOpen }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);

    try {
      const res = await fetch("http://localhost:3092/seller/update-store-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setModalOpen(false);
      router.refresh(); // Reload data if you use Next.js fetch
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">Update Store Picture</h4>
          <button
            onClick={() => setModalOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          className="w-full border p-2 rounded"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
