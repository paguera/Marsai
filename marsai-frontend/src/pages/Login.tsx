import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMemo, useEffect } from "react";

/**
 * Génère le schéma de validation Zod pour le formulaire de connexion.
 * Utilise la fonction de traduction locale (t) pour renvoyer des messages d'erreur traduits.
 */
const getLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.email_required"))
      .max(255, t("validation.email_too_long"))
      // Validation de la structure de l'e-mail par expression régulière
      .refine(
        (val) => {
          /**
           * Expression régulière pour la validation de format e-mail :
           * ^             : Début de la chaîne.
           * [^\s@]+       : Au moins un caractère qui n'est ni un espace (\s) ni un arobase (@).
           * @             : Le symbole arobase obligatoire.
           * [^\s@]+       : Le nom de domaine (sans espace ni arobase).
           * \.            : Un point littéral (échappé avec un antislash).
           * [^\s@]+       : L'extension de domaine (sans espace ni arobase).
           * $             : Fin de la chaîne.
           */
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(val);
        },
        t("validation.email_invalid"),
      ),
    password: z
      .string()
      .min(1, t("validation.password_required")),
  });

type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>;

function Login() {
  const { login } = useAuth();
  const { t, i18n } = useTranslation(["Login", "common"]);

  const loginSchema = useMemo(() => getLoginSchema(t), [t]);
  const resolver = useMemo(() => zodResolver(loginSchema), [loginSchema]);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver,
  });

  // Déclenche une re-validation si la langue change et que des erreurs sont déjà affichées
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, trigger]);

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <div className="min-h-100vh w-full h-full relative">
      <div className="my-50 flex-1 flex items-center justify-center px-4 pt-32 pb-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md p-8 md:p-12 bg-black/60 backdrop-blur-sm border border-white/10 shadow-2xl rounded-[40px] animate-fadeIn"
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              {t("title")}
            </h1>
            <p className="text-white/60 text-sm font-medium">{t("subtitle")}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                {t("email_label")}
              </label>
              <input
                type="email"
                {...register("email")}
                className={`w-full bg-white/5 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-2xl p-4 text-white outline-none focus:border-brand transition-all placeholder:text-white/20`}
                placeholder={t("email_placeholder")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                {t("password_label")}
              </label>
              <input
                type="password"
                {...register("password")}
                className={`w-full bg-white/5 border ${errors.password ? "border-red-500" : "border-white/10"} rounded-2xl p-4 text-white outline-none focus:border-brand transition-all`}
                placeholder={t("password_placeholder")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand hover:bg-brand/80 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand/20 transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t("common:loading") : t("login_button")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
