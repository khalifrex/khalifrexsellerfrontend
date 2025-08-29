import Image from "next/image";
import { use } from "react";

export default function FooterUserInfo({ user }) {
  return (
    <div className="flex items-center space-x-4">
      <Image
        src={user.profileImage}
        alt={user.firstName}
        width={48}
        height={48}
        className="rounded-full object-cover"
      />
      <div>
        <p className="font-medium">{user.firstName} {user.lastName}</p>
        <p className="text-gray-600 text-sm">{user.email}</p>
      </div>
    </div>
  );
}
