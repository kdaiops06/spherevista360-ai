import type { Metadata } from "next";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the SphereVista360 team for questions, feedback, or partnership inquiries.",
};

export default function ContactPage() {
  return (
    <div className="container-main py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
        <p className="mt-4 text-lg text-gray-600">
          Have questions or feedback? We&apos;d love to hear from you.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="card flex items-start gap-4">
            <Mail className="h-6 w-6 text-brand-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="mt-1 text-sm text-gray-600">
                contact@spherevista360.com
              </p>
            </div>
          </div>
          <div className="card flex items-start gap-4">
            <MessageSquare className="h-6 w-6 text-brand-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Feedback</h3>
              <p className="mt-1 text-sm text-gray-600">
                We welcome suggestions to improve the platform.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Send a Message
          </h2>
          <form className="space-y-4" action="#" method="POST">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={5} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
