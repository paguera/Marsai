import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

const registerSchema = z.object({
    email: z
        .string()
        .min(1, "L'email est requis")
        .email("Format d'email invalide"),
    password: z
        .string()
        .min(6, "Le mot de passe doit faire au moins 6 caractères")
        .regex(/[A-Z]/, "Au moins une majuscule")
        .regex(/[0-9]/, "Au moins un chiffre")
        .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
    firstname: z
        .string()
        .min(2, "Le prénom est trop court")
        .max(50, "Le prénom est trop long"),
    lastname: z
        .string()
        .min(2, "Le nom est trop court")
        .max(50, "Le nom est trop long"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function Register() {
    const { t } = useTranslation(["Register", "Dashboard"]);
    const [showPasswordFeedback, setShowPasswordFeedback] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstname: "",
            lastname: "",
        }
    });

    const passwordValue = useWatch({ control, name: "password" });

    /**
     * Calcule le niveau de sécurité du mot de passe saisi.
     * Attribue un score de 0 à 4 basé sur des critères de longueur et d'expression régulière (regex).
     */
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        
        // Critère 1 : Longueur minimale de 8 caractères
        if (password.length >= 8) strength += 1;
        
        // Critère 2 : Présence d'au moins une lettre majuscule (A-Z)
        if (/[A-Z]/.test(password)) strength += 1;
        
        // Critère 3 : Présence d'au moins un chiffre (0-9)
        if (/[0-9]/.test(password)) strength += 1;
        
        // Critère 4 : Présence d'au moins un caractère spécial parmi : @, $, !, %, *, ?, &
        if (/[@$!%*?&]/.test(password)) strength += 1;
        
        return strength;
    };

    const passwordStrength = getPasswordStrength(passwordValue || "");

    const strengthConfig = [
        { min: 0, color: "text-gray-400", label: t("Login.weak"), icon: "🔒" },
        { min: 1, color: "text-yellow-500", label: t("Login.fair"), icon: "🔒" },
        { min: 2, color: "text-orange-500", label: t("Login.good"), icon: "🔒" },
        { min: 3, color: "text-green-500", label: t("Login.strong"), icon: "🔒" },
        { min: 4, color: "text-green-400", label: t("Login.very_strong"), icon: "🔒" },
    ];

    const onSubmit = async (data: RegisterFormData) => {
        setMessage(null);
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + "/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    firstname: data.firstname,
                    lastname: data.lastname,
                }),
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                setMessage({ type: 'success', text: t("alert.success") });
                reset();
            } else {
                // Si le backend renvoie des erreurs de validation détaillées
                if (result.details && Array.isArray(result.details)) {
                    result.details.forEach((err: { field: string, message: string }) => {
                        setError(err.field as keyof RegisterFormData, {
                            type: "server",
                            message: err.message
                        });
                    });
                    setMessage({ type: 'error', text: "Veuillez corriger les erreurs ci-dessous." });
                } else {
                    setMessage({ 
                        type: 'error', 
                        text: result.error || result.message || t("alert.error") 
                    });
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: t("alert.network_error") });
        }
    };

    return (
        <div className="p-5">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="text-primary text-2xl">
                        <span className="text-center">
                            <h1 className="text-left">{t("title")}</h1>
                        </span>
                        <h2 className="text-base/7 font-semibold text-white">
                            {t("register.default_role_notice", { ns: "Dashboard" })}
                        </h2>

                        {message && (
                            <div className={`mt-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="firstname" className="block text-sm/6 font-medium text-white">
                                    {t("firstname_label")}
                                </label>
                                <div className="mt-2">
                                    <div className={`border ${errors.firstname ? 'border-red-500' : 'border-white'} flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}>
                                        <input
                                            id="firstname"
                                            type="text"
                                            {...register("firstname")}
                                            className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-300 focus:outline-none sm:text-sm/6"
                                            placeholder={t("firstname_placeholder")}
                                        />
                                    </div>
                                    {errors.firstname && <p className="mt-1 text-xs text-red-500">{errors.firstname.message}</p>}
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="lastname" className="block text-sm/6 font-medium text-white">
                                    {t("lastname_label")}
                                </label>
                                <div className="mt-2">
                                    <div className={`border ${errors.lastname ? 'border-red-500' : 'border-white'} flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}>
                                        <input
                                            id="lastname"
                                            type="text"
                                            {...register("lastname")}
                                            className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-300 focus:outline-none sm:text-sm/6"
                                            placeholder={t("lastname_placeholder")}
                                        />
                                    </div>
                                    {errors.lastname && <p className="mt-1 text-xs text-red-500">{errors.lastname.message}</p>}
                                </div>
                            </div>

                            <div className="sm:col-span-6">
                                <label htmlFor="email" className="block text-sm/6 font-medium text-white">
                                    {t("email_label")}
                                </label>
                                <div className="mt-2">
                                    <div className={`border ${errors.email ? 'border-red-500' : 'border-white'} flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}>
                                        <input
                                            id="email"
                                            type="email"
                                            {...register("email")}
                                            className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-300 focus:outline-none sm:text-sm/6"
                                            placeholder={t("email_placeholder")}
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-white">
                                    {t("password_label")}
                                </label>
                                <div className="mt-2">
                                    <div className={`border ${errors.password ? 'border-red-500' : 'border-white'} flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}>
                                        <input
                                            id="password"
                                            type="password"
                                            {...register("password")}
                                            className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-300 focus:outline-none sm:text-sm/6"
                                            placeholder={t("password_placeholder")}
                                            onFocus={() => setShowPasswordFeedback(true)}
                                            onBlur={() => setShowPasswordFeedback(false)}
                                        />
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                </div>

                                {showPasswordFeedback && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ease-in-out ${
                                                        passwordStrength === 0 ? "w-0" :
                                                        passwordStrength === 1 ? "w-1/4 bg-yellow-500" :
                                                        passwordStrength === 2 ? "w-2/4 bg-orange-500" :
                                                        passwordStrength === 3 ? "w-3/4 bg-green-500" :
                                                        "w-full bg-green-400"
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex gap-1">
                                                {strengthConfig.map((config) => (
                                                    <span key={config.min} className={passwordStrength >= config.min ? config.color : "text-gray-700"}>
                                                        {config.icon}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-white">
                                    {t("confirm_password_label")}
                                </label>
                                <div className="mt-2">
                                    <div className={`border ${errors.confirmPassword ? 'border-red-500' : 'border-white'} flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-primary`}>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            {...register("confirmPassword")}
                                            className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base text-white placeholder:text-gray-300 focus:outline-none sm:text-sm/6"
                                            placeholder={t("confirm_password_placeholder")}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex p-10 items-center justify-center gap-x-6 ">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-md bg-primary px-6 py-2 text-lg font-semibold text-black shadow-md transition-transform duration-300 ease-in-out hover:scale-1.05 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? t("common:loading") : t("register_button")}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Register;
