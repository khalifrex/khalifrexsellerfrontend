import Image from "next/image";
import { use } from "react";

export default function FooterUserInfo({ user }) {
  return (
    <div className="flex items-center space-x-4">
      <Image
        src={user.storePic}
        alt={user.fullName}
        width={48}
        height={48}
        className="rounded-full object-cover"
      />
      <div>
        <p className="font-medium">{user.fullName}</p>
      </div>
    </div>
  );
}
