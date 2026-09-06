import { useTranslation } from "react-i18next";

function NewsletterSubscribe() {
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/subscribers/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );
      if (response.ok) {
        alert(t("newsletter.success_message"));
        form.reset();
      } else if (response.status === 409) {
        alert(t("newsletter.error_message_conflict"));
      }
    } catch (error) {
      alert(t("newsletter.error_message" + error));
    }
  }

  return (
    <div className="my-20 flex justify-center w-full px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-12 glass-panel-dark">
          <div className="text-center md:text-left">
            <p className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              {t("newsletter.title")}
            </p>
            <p className="text-white/60 text-sm font-medium">
              Restez informé des actualités du festival
            </p>
          </div>

          <div className="flex flex-col w-full sm:w-full gap-4">
            <input
              name="email"
              type="email"
              required
              placeholder={t("newsletter.email_placeholder")}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-brand transition-all text-white placeholder:text-white/20 min-w-[25%]"
            />
            <button className="bg-brand hover:bg-brand/80 text-black font-bold px-8 py-4 rounded-2xl shadow-lg shadow-brand/20 transition-all uppercase tracking-widest text-sm whitespace-nowrap">
              {t("newsletter.subscribe_button")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NewsletterSubscribe;
