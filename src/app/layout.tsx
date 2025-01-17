import "./globals.css";

export const metadata = {
  title: 'Order Management System',
  description: 'A system for managing custom product orders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white">
      <body className="h-full bg-white">
        {children}
      </body>
    </html>
  );
}
