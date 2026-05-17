import { CartProvider } from "@/features/cart/CartProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TelegramWidget } from "@/components/ui/TelegramWidget";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <TelegramWidget />
    </CartProvider>
  );
}
