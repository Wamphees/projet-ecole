import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 Ici tu brancheras ton backend plus tard
    console.log("Message envoyé :", form);

    setSuccess(true);
    setForm({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* INFOS */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Contactez-nous
          </h1>
          <p className="text-gray-600 mb-8">
            Une question, un problème ou une collaboration ?  
            Écris-nous, on te répondra rapidement 👌
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Mail className="text-blue-600" />
              <span className="text-gray-700">medismart.com</span>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-blue-600" />
              <span className="text-gray-700">+237 6XX XXX XXX</span>
            </div>

            <div className="flex items-center gap-4">
              <MapPin className="text-blue-600" />
              <span className="text-gray-700">
                Yaoundé, Cameroun
              </span>
            </div>
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Envoyer un message
          </h2>

          {success && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              Message envoyé avec succès !
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Votre nom"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Votre email"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder="Sujet"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              placeholder="Votre message"
              rows={5}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
            >
              <Send className="w-5 h-5" />
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
