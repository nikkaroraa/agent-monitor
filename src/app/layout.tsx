import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-provider";
import { Toaster } from "sonner";

const inter = Inter({ 
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "Mission Control | Agent Monitor",
	description: "Real-time monitoring dashboard for the multi-agent system",
};

export const viewport = {
	themeColor: "#0a0a0f",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body className={`${inter.className} ${inter.variable} antialiased`}>
				<ConvexClientProvider>{children}</ConvexClientProvider>
				<Toaster 
					position="top-right"
					theme="dark"
					toastOptions={{
						style: {
							background: "#121212",
							border: "1px solid #262626",
							color: "#e8e8e8",
						},
					}}
				/>
			</body>
		</html>
	);
}
