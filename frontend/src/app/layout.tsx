export const metadata = {
  title: "Social Media App",
  description: "A modern social media platform."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

import "./globals.css";
import ClientLayout from "./ClientLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
