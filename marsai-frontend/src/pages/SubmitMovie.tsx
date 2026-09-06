// =============================================================================
// COMPOSANT : SubmitMovie.tsx
// RÔLE : Formulaire multi-étapes de soumission de film avec gestion de fichiers
// TECHS : React, React Hook Form, useFieldArray, Zod (Validation), i18next (Traduction)
// =============================================================================

import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormInput from "../components/FormInput";
import Footer from "../components/Footer";

// -----------------------------------------------------------------------------
// 1. SCHÉMAS DE VALIDATION (ZOD)
// On définit des fonctions générant les schémas avec les traductions dynamiques.
// -----------------------------------------------------------------------------

// Schéma pour un collaborateur individuel (utilisé dans le tableau de la page 3)
const getCollaboratorSchema = (t: (key: string) => string) =>
  z.object({
    firstname: z.string().min(2, t("validation.firstname")),
    lastname: z.string().min(2, t("validation.lastname")),
    job: z.string().min(2, t("validation.job")),
  });

// Schéma global du formulaire
const getSubmitMovieSchema = (t: (key: string) => string) =>
  z.object({
    // PAGE 1 : Informations du réalisateur (Director)
    gender: z.string().min(1, t("validation.gender")),
    firstname: z.string().min(2, t("validation.firstname")),
    lastname: z.string().min(2, t("validation.lastname")),
    email: z
      .string()
      .min(1, t("validation.email_required"))
      .max(255, t("validation.email_too_long"))
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
    birthdate: z.string().min(1, t("validation.birthdate")),
    job: z.string().min(2, t("validation.job")),
    country: z.string().min(1, t("validation.country")),
    city: z.string().min(1, t("validation.city")),
    phone: z.string().regex(
      (() => {
        /**
         * Expression régulière pour valider le numéro de téléphone international :
         * ^             : Début de la chaîne.
         * \+?           : Un symbole plus (+) optionnel (préfixe international).
         * [0-9]{10,15}  : Entre 10 et 15 chiffres consécutifs.
         * $             : Fin de la chaîne.
         */
        return /^\+?[0-9]{10,15}$/;
      })(),
      t("validation.phone_invalid")
    ),

    // PAGE 2 : Détails techniques et artistiques du film
    original_title: z.string().min(1, t("validation.original_title")),
    english_title: z.string().min(1, t("validation.english_title")),
    original_synopsis: z
      .string()
      .min(10, t("validation.original_synopsis_too_short")),
    english_synopsis: z
      .string()
      .min(10, t("validation.english_synopsis_too_short")),
    is_hybrid: z.boolean().nonoptional(),
    ia_tools: z.string().min(1, t("validation.ia_tools")),
    creative_process: z
      .string()
      .min(10, t("validation.creative_process_too_short")),
    tags: z.string().min(1, t("validation.tags")),

    // --- GESTION DES FICHIERS (Validation rigoureuse du type et du poids) ---
    // Validation pour le film : MP4, MOV, MKV et 500 Mo max
    movie: z
      .any()
      .refine((file) => file instanceof File, t("validation.movie_required"))
      .refine(
        (file) => file?.size <= 500 * 1024 * 1024,
        t("validation.movie_too_heavy"),
      )
      .refine(
        (file) =>
          ["video/mp4", "video/quicktime", "video/x-matroska"].includes(
            file?.type,
          ),
        t("validation.movie_invalid_format"),
      ),

    // Validation pour les images : JPG, JPEG, PNG, WEBP et 50 Mo max
    image1: z
      .any()
      .refine((file) => file instanceof File, t("validation.image1_required"))
      .refine(
        (file) => file?.size <= 50 * 1024 * 1024,
        t("validation.image_too_heavy"),
      )
      .refine(
        (file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file?.type),
        t("validation.image_invalid_format"),
      ),

    image2: z
      .any()
      .refine((file) => file instanceof File, t("validation.image2_required"))
      .refine(
        (file) => file?.size <= 50 * 1024 * 1024,
        t("validation.image_too_heavy"),
      )
      .refine(
        (file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file?.type),
        t("validation.image_invalid_format"),
      ),

    image3: z
      .any()
      .refine((file) => file instanceof File, t("validation.image3_required"))
      .refine(
        (file) => file?.size <= 50 * 1024 * 1024,
        t("validation.image_too_heavy"),
      )
      .refine(
        (file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file?.type),
        t("validation.image_invalid_format"),
      ),

    // PAGE 3 : Collaborateurs (Tableau dynamique)
    collaborators: z.array(getCollaboratorSchema(t)),
  });

// Extraction du type TypeScript à partir du schéma Zod
type SubmitMovieFormData = z.infer<ReturnType<typeof getSubmitMovieSchema>>;

// Export du composant principal MVP
export default function SubmitMovie() {
  // Traduction (Namespace 'SubmitMovie' pour les labels, 'common' pour les boutons)
  const { t, i18n } = useTranslation(["SubmitMovie", "common"]);

  // On mémoïse le schéma de validation Zod pour qu'il soit recalculé à chaque changement de langue
  const submitMovieSchema = useMemo(() => getSubmitMovieSchema(t), [t]);

  // On mémoïse également le resolver pour éviter de le recréer à chaque render
  const resolver = useMemo(() => zodResolver(submitMovieSchema), [submitMovieSchema]);

  // ÉTAT LOCAL : Gestion de l'étape actuelle (1, 2 ou 3)
  const [page, setPage] = useState<number>(1);
  // ÉTAT LOCAL : Message de retour utilisateur (Succès, Erreur ou Info)
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const isSending = useRef(false);

  // -----------------------------------------------------------------------------
  // 2. CONFIGURATION DE REACT HOOK FORM
  // -----------------------------------------------------------------------------
  const {
    register, // Enregistre les inputs dans le state du formulaire
    handleSubmit, // Gère la soumission finale et la validation globale
    trigger, // Permet de valider manuellement un groupe de champs (pour le multi-étapes)
    setValue, // Modifie manuellement une valeur (utilisé pour les fichiers)
    watch, // Surveille les changements de valeurs en temps réel (pour l'aperçu du nom de fichier)
    control, // Nécessaire pour useFieldArray (champs dynamiques)
    formState: { errors, isSubmitting }, // État du formulaire (erreurs de validation, statut d'envoi)
  } = useForm<SubmitMovieFormData>({
    resolver, // Connecte le resolver mémoïsé à React Hook Form
    defaultValues: {
      gender: "",
      collaborators: [],
    },
  });

  // Déclenche une re-validation si la langue change et que des erreurs sont déjà affichées
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, trigger]);

  // Gestion du tableau dynamique de collaborateurs (Ajouter/Supprimer)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "collaborators",
  });

  // Surveillance du fichier film pour afficher son nom après sélection
  const movieFile = watch("movie");

  // -----------------------------------------------------------------------------
  // 3. LOGIQUE DE NAVIGATION
  // -----------------------------------------------------------------------------

  // Retour à l'étape précédente
  const handlePreviousPage = () => {
    setMessage(null); // On efface les messages d'erreur au changement de page
    if (page > 1) setPage(page - 1);
  };

  // Passage à l'étape suivante (avec validation partielle)
  const handleNextPage = async () => {
    setMessage(null);
    let fieldsToValidate: any[] = [];

    // On définit quels champs doivent être valides pour quitter la page actuelle
    if (page === 1) {
      fieldsToValidate = [
        "gender",
        "firstname",
        "lastname",
        "email",
        "birthdate",
        "job",
        "country",
        "city",
        "phone",
      ];
    } else if (page === 2) {
      fieldsToValidate = [
        "original_title",
        "english_title",
        "original_synopsis",
        "english_synopsis",
        "ia_tools",
        "is_hybrid",
        "creative_process",
        "tags",
        "movie",
        "image1",
        "image2",
        "image3",
      ];
    } else return;

    // trigger() lance la validation Zod uniquement sur les champs listés
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setPage(page + 1);
  };

  // -----------------------------------------------------------------------------
  // 4. SOUMISSION FINALE (API)
  // -----------------------------------------------------------------------------
  // -----------------------------------------------------------------------------
  // 4. SOUMISSION FINALE (API)
  // -----------------------------------------------------------------------------
  const onSubmit = async (data: SubmitMovieFormData) => {
    if (isSending.current) return;
    isSending.current = true;
    setMessage({ type: "info", text: t("message.sending") });

    // On utilise FormData car le formulaire contient des fichiers binaires
    const formData = new FormData();

    // Sécurité anti-doublon côté serveur
    formData.append("x-duplicate-protection", "true");

    // Le header 'x-duplicate-protection' avec la valeur 'true' indique au serveur qu'il doit activer une protection contre les doublons
    // TODO:    Vérifier si la même donnée n'a pas déjà été soumise
    //          Ignorer les requêtes qui contiennent ce header s'il a déjà traité les données
    //          Maintenir un historique des données déjà traitées

    // A. Traitement des champs texte
    const textFields: { [key: string]: string | number | boolean | undefined } =
      {};
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof SubmitMovieFormData];
      if (typeof value === "string" && value.trim() !== "") {
        // La chaîne n'est pas vide après avoir supprimé les espaces
        textFields[key] = value;
      } else if (typeof value === "number") {
        textFields[key] = value;
      } else if (typeof value === "boolean") {
        textFields[key] = value ? 1 : 0;
      }
    });

    // B. Formatage des clés pour le serveur (Ajout du préfixe director_ pour certains champs)
    const directorKeys = [
      "firstname",
      "lastname",
      "email",
      "gender",
      "job",
      "birthdate",
      "country",
      "city",
      "phone",
    ];
    Object.entries(textFields).forEach(([key, value]) => {
      const finalKey = directorKeys.includes(key) ? `director_${key}` : key;
      formData.append(finalKey, String(value));
    });

    // C. Sérialisation du tableau de collaborateurs en JSON string
    if (data.collaborators && Array.isArray(data.collaborators)) {
      formData.append("collaborators", JSON.stringify(data.collaborators));
    }

    // D. Ajout des fichiers binaires
    const fileKeys: Array<keyof SubmitMovieFormData> = [
      "movie",
      "image1",
      "image2",
      "image3",
    ];
    fileKeys.forEach((key) => {
      const fileValue = data[key as keyof SubmitMovieFormData];
      if (fileValue instanceof File) {
        formData.append(key as string, fileValue);
      }
    });

    // E. Appel API
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/movies`, {
        method: "POST",
        body: formData, // Le navigateur gère automatiquement le Content-Type: multipart/form-data
      });

      if (!response.ok)
        throw new Error(t("message.http_error", { status: response.status }));

      const result: any = await response.json();

      // Affichage du succès avec l'ID généré par le backend
      if (result && typeof result.id === "string" && result.id.length > 0) {
        setMessage({
          type: "success",
          text: t("message.success.with_id", { id: result.id }),
        });
      } else {
        setMessage({ type: "success", text: t("message.success.generic") });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: t("message.error", {
          message: error.message || "Une erreur est survenue.",
        }),
      });
    } finally {
      isSending.current = false;
    }
  };
  // Configuration visuelle du Stepper
  const steps = [
    { id: 1, label: t("personal_informations"), icon: "👤" },
    { id: 2, label: t("movie_details"), icon: "🎬" },
    { id: 3, label: t("collaborators"), icon: "👥" },
  ];

  // Remonter en haut de page à chaque changement d'étape
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="min-h-100vh w-full h-full relative">
      <div className="w-full m-auto max-w-5xl md:px-4 my-50">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-dark/50 backdrop-blur-md w-full p-2 md:p-8 md:p-12 rounded-[40px] border border-white/10 shadow-2xl"
        >
          {/* RETOUR UTILISATEUR : role="alert" pour que le lecteur d'écran lise le message immédiatement */}
          {message && (
            <div
              role="alert"
              aria-live="polite"
              className={`mb-8 p-4 rounded-2xl text-center font-bold animate-fadeIn ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-500 border border-green-500/50"
                  : message.type === "error"
                    ? "bg-red-500/20 text-red-500 border border-red-500/50"
                    : "bg-blue-500/20 text-blue-500 border border-blue-500/50"
              }`}
            >
              {message.text}
            </div>
          )}
          {/* STEPPER : Navigation visuelle de la progression */}
          <nav
            aria-label="Progression du formulaire"
            className="max-w-4xl mx-auto mb-12 relative z-10"
          >
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -translate-y-1/2 -z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-1 bg-brand -translate-y-1/2 transition-all duration-500 ease-in-out -z-0"
                style={{ width: `${((page - 1) / (steps.length - 1)) * 100}%` }}
                aria-hidden="true"
              ></div>

              {steps.map((step) => (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center"
                  aria-current={page === step.id ? "step" : undefined}
                >
                  <div
                    aria-label={`${step.label}${page >= step.id ? " (Complété)" : ""}`}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                      page >= step.id
                        ? "bg-brand text-white scale-110 shadow-[0_0_15px_rgba(47,174,224,0.5)]"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    <span aria-hidden="true">{step.icon}</span>
                  </div>
                  <span
                    className={`mt-2 text-xs font-bold uppercase tracking-wider ${page >= step.id ? "text-brand" : "text-gray-500"}`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </nav>

          {/* PAGE 1: INFORMATIONS DU RÉALISATEUR */}
          {page === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-brand mb-8 flex items-center gap-3">
                <span className="bg-brand/20 p-2 rounded-lg">👤</span>
                {t("personal_informations")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="gender-select"
                    className="text-sm font-semibold text-gray-400"
                  >
                    {t("gender")}
                  </label>
                  <select
                    id="gender-select"
                    {...register("gender")}
                    aria-invalid={errors.gender ? "true" : "false"}
                    className={`bg-brand2 border ${errors.gender ? "border-red-500" : "border-border"} rounded-xl p-3 text-white outline-none focus:border-brand transition-all`}
                  >
                    <option value="">{t("gender_select")}</option>
                    <option value="Male">{t("gender_male")}</option>
                    <option value="Female">{t("gender_female")}</option>
                    <option value="Other">{t("gender_other")}</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs" role="alert">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <FormInput
                  label={t("firstname_label")}
                  placeholder={t("firstname_placeholder")}
                  id="firstname"
                  type="text"
                  register={register("firstname")}
                  error={errors.firstname?.message}
                />
                <FormInput
                  id="lastname"
                  label={t("lastname_label")}
                  type="text"
                  placeholder={t("lastname_placeholder")}
                  register={register("lastname")}
                  error={errors.lastname?.message}
                />
                <FormInput
                  id="email"
                  label={t("email_label")}
                  type="email"
                  register={register("email")}
                  error={errors.email?.message}
                />
                <FormInput
                  id="birthdate"
                  label={t("birthdate_label")}
                  type="date"
                  register={register("birthdate")}
                  error={errors.birthdate?.message}
                />
                <FormInput
                  id="job"
                  label={t("contribution_label")}
                  placeholder={t("contribution_placeholder")}
                  register={register("job")}
                  error={errors.job?.message}
                />
                <FormInput
                  id="country"
                  label={t("country_label")}
                  register={register("country")}
                  error={errors.country?.message}
                />
                <FormInput
                  id="city"
                  label={t("city_label")}
                  register={register("city")}
                  error={errors.city?.message}
                />
                <FormInput
                  id="phone"
                  label={t("phone_label")}
                  type="tel"
                  register={register("phone")}
                  error={errors.phone?.message}
                />
              </div>
            </div>
          )}

          {/* PAGE 2: DÉTAILS DU FILM ET UPLOADS */}
          {page === 2 && (
            <div className="animate-fadeIn space-y-10">
              <h2 className="text-3xl font-bold text-brand flex items-center gap-3">
                <span className="bg-brand/20 p-2 rounded-lg">🎬</span>
                {t("movie_details")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 bg-brand2/30 rounded-2xl border border-border">
                {/* Colonne Langue Originale */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white border-b border-brand/30 pb-2">
                    {t("original_language_label")}
                  </h3>
                  <FormInput
                    id="original_title"
                    label={t("original_title_label")}
                    register={register("original_title")}
                    error={errors.original_title?.message}
                  />
                  <FormInput
                    id="original_synopsis"
                    label={t("original_synopsis_label")}
                    isTextArea={true}
                    register={register("original_synopsis")}
                    error={errors.original_synopsis?.message}
                  />
                </div>
                {/* Colonne Traduction Anglaise */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white border-b border-brand/30 pb-2">
                    {t("english_international")}
                  </h3>
                  <FormInput
                    id="english_title"
                    label={t("english_title_label")}
                    register={register("english_title")}
                    error={errors.english_title?.message}
                  />
                  <FormInput
                    id="english_synopsis"
                    label={t("english_synopsis_label")}
                    isTextArea={true}
                    register={register("english_synopsis")}
                    error={errors.english_synopsis?.message}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <FormInput
                  id="is_hybrid"
                  label={t("isHybrid_description")}
                  type="checkbox"
                  register={register("is_hybrid")}
                  error={errors.is_hybrid?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  id="ia_tools"
                  label={t("ia_tools_label")}
                  register={register("ia_tools")}
                  error={errors.ia_tools?.message}
                />
                <FormInput
                  id="creative_process"
                  label={t("creative_process_label")}
                  register={register("creative_process")}
                  error={errors.creative_process?.message}
                />
                <FormInput
                  id="tags"
                  label={t("tags_label")}
                  placeholder={t("tags_placeholder")}
                  register={register("tags")}
                  error={errors.tags?.message}
                />
              </div>

              {/* SECTION UPLOAD : fichiers binaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                {/* Film (Vidéo) */}
                <div className="space-y-4">
                  <label
                    htmlFor="movie-upload"
                    className="block text-sm font-bold text-brand uppercase tracking-widest"
                  >
                    {t("upload_file_label_movie_raw")}
                  </label>
                  <div
                    className={`relative group border-2 border-dashed ${errors.movie ? "border-red-500" : "border-border"} hover:border-brand rounded-2xl p-8 transition-all text-center`}
                  >
                    <input
                      id="movie-upload"
                      type="file"
                      aria-label="Sélectionner le fichier du film"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        setValue("movie", e.target.files?.[0] || null, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <div
                      className="text-brand text-4xl mb-2"
                      aria-hidden="true"
                    >
                      📹
                    </div>
                    <p className="text-white font-medium">
                      {movieFile instanceof File
                        ? movieFile.name
                        : t("upload_movie_placeholder")}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {t("upload_movie_help")}
                    </p>
                  </div>
                  {errors.movie && (
                    <p
                      className="text-red-500 text-xs text-center"
                      role="alert"
                    >
                      {errors.movie.message as string}
                    </p>
                  )}
                </div>

                {/* Galerie d'images (3 obligatoires) */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-brand uppercase tracking-widest">
                    {t("movie_images_label")}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["image1", "image2", "image3"].map((fieldName, i) => {
                      const img = watch(fieldName as any);
                      const hasError =
                        errors[fieldName as keyof SubmitMovieFormData];
                      return (
                        <div
                          key={i}
                          className={`relative aspect-square border-2 border-dashed ${hasError ? "border-red-500" : "border-border"} hover:border-brand rounded-xl flex items-center justify-center transition-all`}
                        >
                          <input
                            type="file"
                            aria-label={`Sélectionner l'image ${i + 1}`}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) =>
                              setValue(
                                fieldName as any,
                                e.target.files?.[0] || null,
                                { shouldValidate: true },
                              )
                            }
                          />
                          {img instanceof File ? (
                            <div
                              className="text-green-500 text-2xl"
                              aria-label="Fichier sélectionné"
                            >
                              ✓
                            </div>
                          ) : (
                            <div
                              className="text-gray-600 text-2xl"
                              aria-hidden="true"
                            >
                              +
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {t("movie_images_help")}
                  </p>
                  {(errors.image1 || errors.image2 || errors.image3) && (
                    <p
                      className="text-red-500 text-xs text-center"
                      role="alert"
                    >
                      {t("movie_images_error")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 3: COLLABORATEURS (CHAMPS DYNAMIQUES) */}
          {page === 3 && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-brand flex items-center gap-3">
                  <span className="bg-brand/20 p-2 rounded-lg">👥</span>
                  {t("collaborators_informations")}
                </h2>
                {/* Bouton pour ajouter une ligne au tableau */}
                <button
                  type="button"
                  onClick={() =>
                    append({ firstname: "", lastname: "", job: "" })
                  }
                  aria-label="Ajouter un collaborateur"
                  className="bg-brand hover:bg-brand/80 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-brand/20 flex items-center gap-2"
                >
                  <span aria-hidden="true">+</span>{" "}
                  {t("actions.add", { ns: "common" })}
                </button>
              </div>

              <div className="space-y-12">
                {fields.length === 0 && (
                  <p
                    className="text-center text-gray-500 italic py-10 border-2 border-dashed border-gray-800 rounded-2xl"
                    role="status"
                  >
                    {t("no_collaborators")}
                  </p>
                )}
                {fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="p-8 border border-border rounded-2xl bg-brand2/10 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-brand"></div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">
                        {t("collaborator_number", { number: i + 1 })}
                      </h3>
                      {/* Bouton pour supprimer une ligne spécifique */}
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="text-red-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Supprimer le collaborateur ${i + 1}`}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FormInput
                        id={`collaborators.${i}.firstname`}
                        label={t("firstname_label")}
                        register={register(
                          `collaborators.${i}.firstname` as const,
                        )}
                        error={errors.collaborators?.[i]?.firstname?.message}
                      />
                      <FormInput
                        id={`collaborators.${i}.lastname`}
                        label={t("lastname_label")}
                        register={register(
                          `collaborators.${i}.lastname` as const,
                        )}
                        error={errors.collaborators?.[i]?.lastname?.message}
                      />
                      <FormInput
                        id={`collaborators.${i}.job`}
                        label={t("contribution_label")}
                        register={register(`collaborators.${i}.job` as const)}
                        error={errors.collaborators?.[i]?.job?.message}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BARRE DE NAVIGATION (BOUTONS) */}
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex gap-4 w-full justify-center">
              {/* Bouton Précédent (Caché à l'étape 1) */}
              {page > 1 && (
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  aria-label={t("aria.previous_step")}
                  className="px-8 py-3 rounded-xl border border-brand text-brand font-bold hover:bg-brand hover:text-white transition-all duration-300"
                >
                  ← {t("previous-button")}
                </button>
              )}

              {/* Bouton Suivant OU Soumettre */}
              {page < 3 ? (
                <button
                  key="btn-next"
                  type="button"
                  aria-label={t("aria.next_step")}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNextPage();
                  }}
                  className="px-12 py-3 rounded-xl bg-brand text-white font-bold hover:brightness-110 shadow-lg shadow-brand/20 transition-all duration-300"
                >
                  {t("next-button")} →
                </button>
              ) : (
                <button
                  key="btn-submit"
                  type="button"
                  aria-label={t("aria.submit_form")}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(onSubmit)(e); //handleSubmit déclenche la validation finale avant onSubmit
                  }}
                  disabled={isSubmitting}
                  className="px-16 py-4 rounded-xl bg-brand text-white font-bold text-xl hover:scale-105 shadow-2xl shadow-brand/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? `🚀 ${t("message.sending")}` : `🚀 ${t("submit-button")}`}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
