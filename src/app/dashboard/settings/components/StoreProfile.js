"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import StoreImageModal from "./StoreImageModal";

export default function StoreProfile({ sellerInfo }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="bg-white shadow rounded p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <Image
            src={sellerInfo?.storePic || "/avatar-placeholder.png"}
            alt="Store Profile"
            width={64}
            height={64}
            className="rounded-full object-cover border"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            <Pencil className="text-white w-5 h-5" />
          </button>
        </div>
        <h3 className="text-lg font-semibold">{sellerInfo?.storeName || "My Store"}</h3>
      </div>
      <div className="mt-2 text-sm text-gray-600">
  {sellerInfo.pendingEmail && (
    <p className="text-yellow-600">
      New email pending verification: {sellerInfo.pendingEmail}
    </p>
  )}
  {sellerInfo.pendingPhone && (
    <p className="text-yellow-600">
      New phone pending verification: {sellerInfo.pendingPhone}
    </p>
  )}
</div>

      {modalOpen && <StoreImageModal setModalOpen={setModalOpen} />}
    </section>
  );
}
