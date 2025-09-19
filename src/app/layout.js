import "./globals.css";

export const metadata = {
  title: "Prompt Manager",
  description: "Manage AI prompts and compositions for news evaluation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
