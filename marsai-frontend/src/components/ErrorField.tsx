import type { FieldError } from "react-hook-form";

interface ErrorFieldProps {
    error?: FieldError;
    message?: string;
}

export function ErrorField({ error, message }: ErrorFieldProps) {
    if (!error && !message) return null;

    return (
        <div className="text-red-400 text-sm mt-1">
            {error?.message || message}
        </div>
    );
}