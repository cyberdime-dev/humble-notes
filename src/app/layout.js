import { Inter } from "next/font/google";
import "./globals.css";
import { AuthContextProvider } from "../contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Humble Notes - Simple Note Taking App",
  description: "A beautiful and simple note-taking application for capturing your thoughts and ideas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
