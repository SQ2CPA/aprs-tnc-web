import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) {
        return `${diffSeconds}s`;
    } else if (diffSeconds < 3600) {
        return `${Math.floor(diffSeconds / 60)}m`;
    } else if (diffSeconds < 86400) {
        return `${Math.floor(diffSeconds / 3600)}h`;
    } else {
        return `${Math.floor(diffSeconds / 86400)}d`;
    }
};
