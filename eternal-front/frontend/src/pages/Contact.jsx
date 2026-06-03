import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast("Message sent! We'll respond within 24 hours. (Demo)");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-28 pb-28 md:pb-16 min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="Get in Touch"
          title="Contact Us"
          subtitle="We'd love to hear from you. Reach out for orders, partnerships, or fragrance consultations."
        />

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "hello@eternalstand.com" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210" },
              { icon: MapPin, label: "Address", value: "Bandra West, Mumbai, India 400050" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 glass rounded-xl p-6">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-gold mb-1">{label}</p>
                  <p className="text-stone-600">{value}</p>
                </div>
              </div>
            ))}
            <div className="glass rounded-xl p-6">
              <p className="text-sm text-stone-500">
                <strong className="text-stone-800">Hours:</strong> Mon–Sat 10am–8pm IST
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
            <input
              required
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-gold/50 outline-none"
            />
            <input
              required
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-gold/50 outline-none"
            />
            <textarea
              required
              rows={5}
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-gold/50 outline-none resize-none"
            />
            <Button type="submit" variant="primary" className="w-full">
              <Send className="w-4 h-4" /> Send Message
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
