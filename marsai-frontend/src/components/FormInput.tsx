import type { UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
  label: string;
  id: string;
  name?: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "checkbox";
  placeholder?: string;
  isTextArea?: boolean;
  register: UseFormRegisterReturn;
  error?: string;
}

const FormInput = ({
  label,
  id,
  type = "text",
  placeholder,
  isTextArea = false,
  register,
  error,
  ...rest
}: FormInputProps) => {
  const inputBaseClass = `block w-full rounded-md px-3 py-1.5 text-base text-white placeholder:text-white/50 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm border ${
    error ? "border-red-500 outline-red-500" : "border-white outline-white"
  }`;

  const errorId = `${id}-error`;

  if (type === "checkbox") {
    return (
      <div className="col-span-full">
        <div className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            <input
              id={id}
              type="checkbox"
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-white/20 bg-white/5 transition-all checked:bg-brand checked:border-brand hover:border-brand/50 focus:outline-none focus:ring-4 focus:ring-brand/20"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? errorId : undefined}
              {...register}
              {...rest}
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.4l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <label htmlFor={id} className="text-base font-semibold text-white cursor-pointer select-none group-hover:text-brand transition-colors">
            {label}
          </label>
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-xs text-red-500 animate-fadeIn" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <label htmlFor={id} className="block text-sm font-medium text-white">
        {label}
      </label>
      <div className="mt-2">
        {isTextArea ? (
          <textarea
            id={id}
            rows={3}
            placeholder={placeholder}
            className={inputBaseClass}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : undefined}
            {...register}
            {...rest}
          />
        ) : (
          <div className={`flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary border ${
            error ? "border-red-500 outline-red-500" : "border-white outline-white"
          }`}>
            <input
              id={id}
              type={type}
              placeholder={placeholder}
              className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-white/50 focus:outline-none sm:text-sm"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? errorId : undefined}
              {...register}
              {...rest}
            />
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500 animate-fadeIn" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
