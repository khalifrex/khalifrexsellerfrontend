import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import ClientProviders from './client-provider';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Khalifrex Seller",
  description: "Sell on Khalifrex - Fastest Growing Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <ClientProviders>
        {children}
        </ClientProviders>
        </CartProvider>
      </body>
    </html>   
  );
}
