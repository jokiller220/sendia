import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft } from 'lucide-react';

export const DocumentSelectScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<string>('cni');

  const options = [
    { id: 'cni', label: "Carte nationale d'identité", desc: 'Recommandé pour la zone UEMOA et UE' },
    { id: 'passport', label: 'Passeport', desc: 'Passeport biométrique international' },
    { id: 'residence', label: 'Titre de séjour', desc: 'Titre de séjour européen en cours de validité' },
    { id: 'license', label: 'Permis de conduire', desc: 'Permis de conduire avec photo' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      <div>
        <button
          onClick={() => setCurrentScreen('kyc_overview')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Pièce d'identité
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sélectionnez le type de document que vous souhaitez numériser.
        </p>

        {/* Radio Cards */}
        <div className="mt-6 space-y-3">
          {options.map(item => {
            const isSelected = selectedDoc === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedDoc(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Assurez-vous que votre document est valide et en bon état.
        </p>
      </div>

      <div className="pb-4">
        <button
          onClick={() => setCurrentScreen('kyc_doc_capture')}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition"
        >
          Continuer
        </button>
      </div>
    </div>
  );
};
