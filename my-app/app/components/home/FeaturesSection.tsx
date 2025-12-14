
import React from 'react';
import { Video, FileText, MessageCircle, Smartphone, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'Téléconsultation',
    description: 'Consultez depuis chez vous avec des médecins en vidéo'
  },
  {
    icon: FileText,
    title: 'Dossier Médical',
    description: 'Vos documents de santé sécurisés en ligne'
  },
  {
    icon: Smartphone,
    title: 'Application Mobile',
    description: 'Gérez vos rendez-vous où que vous soyez'
  }
];

function FeaturesSection(){
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Une expérience patient complète
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


export default FeaturesSection;