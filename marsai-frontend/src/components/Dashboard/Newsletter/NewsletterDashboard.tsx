import NewsletterSend from "./NewsletterSend";
import SubscribersDashboard from "./SubscribersDashboard";
import NewsletterCreate from "./NewsletterCreate";

function NewsletterDashboard() {
  return (
    <div className="w-full p-6 bg-dark rounded-2xl text-white flex flex-col gap-10">
      <SubscribersDashboard />

      <NewsletterCreate />

      <NewsletterSend />
    </div>
  );
}

export default NewsletterDashboard;
