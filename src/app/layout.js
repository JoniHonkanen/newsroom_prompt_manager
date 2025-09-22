import "./globals.css";
import HeaderNav from "./components/HeaderNav";

export const metadata = {
  title: "Prompt Manager",
  description: "Manage AI prompts and compositions for news evaluation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <HeaderNav />
        <main style={{ paddingTop: "1rem" }}>{children}</main>
      </body>
    </html>
  );
}
