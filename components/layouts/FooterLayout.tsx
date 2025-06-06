import type React from "react";

const Footer = () => (
    <footer className="w-full py-6 mt-auto">
        <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center text-xs p-4 bg-white border border-gray-200 rounded-lg text-black dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                <p>Copyright &copy; {new Date().getFullYear()} Damian SQ2CPA</p>
                <p>Made with ❤️ in Poland</p>
            </div>
        </div>
    </footer>
);

interface FooterLayoutProps {
    children: React.ReactNode;
}

export default function FooterLayout({ children }: FooterLayoutProps) {
    return (
        <div className="container max-w-4xl py-10">
            {children}

            <Footer />
        </div>
    );
}
