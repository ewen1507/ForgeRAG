// app/layout.tsx

import { Toaster } from "@/components/ui/sonner"; // Assure-toi que l'import est correct

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <head />
        <body>
        <main>{children}</main>  {/* Contenu dynamique de l'application */}
        <Toaster />  {/* Le Toaster pour afficher les notifications */}
        </body>
        </html>
    );
}