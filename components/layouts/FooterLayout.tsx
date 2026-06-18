import type React from "react";
import { cn } from "@/lib/utils";

interface FooterProps {
    maxWidthClassName?: string;
}

const Footer = ({ maxWidthClassName = "max-w-4xl" }: FooterProps) => (
    <footer className="w-full py-6 mt-auto">
        <div
            className={cn("container mx-auto px-4", maxWidthClassName)}
        >
            <div className="text-center text-xs p-4 bg-white border border-gray-200 rounded-lg text-black dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300">
                <p>Copyright &copy; {new Date().getFullYear()} Damian SQ2CPA</p>
                <p>Made with ❤️ in Poland</p>
            </div>
        </div>
    </footer>
);

interface FooterLayoutProps {
    children: React.ReactNode;
    maxWidthClassName?: string;
}

export default function FooterLayout({
    children,
    maxWidthClassName = "max-w-4xl",
}: FooterLayoutProps) {
    return (
        <div className={cn("container py-10", maxWidthClassName)}>
            {children}

            <Footer maxWidthClassName={maxWidthClassName} />
        </div>
    );
}
