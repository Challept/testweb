import React, { useState, useEffect } from 'react';
import { Palette, ShoppingBag, Smartphone, Loader2, Check } from 'lucide-react';

// Declare the Stripe global variable
declare const Stripe: any;

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });

  const [isValid, setIsValid] = useState({
    name: false,
    email: false,
    age: false,
    hash: false
  });

  const [status, setStatus] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check URL hash on component mount and hash changes
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      setIsValid(prev => ({
        ...prev,
        hash: hash === '71746hf1941749de'
      }));
    };

    window.addEventListener('hashchange', checkHash);
    checkHash(); // Check on initial load

    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    let isFieldValid = false;
    switch (name) {
      case 'name':
        isFieldValid = value.trim().length >= 2;
        break;
      case 'email':
        isFieldValid = validateEmail(value);
        break;
      case 'age':
        isFieldValid = parseInt(value) >= 16 && parseInt(value) <= 120;
        break;
    }

    setIsValid(prev => ({ ...prev, [name]: isFieldValid }));
  };

  const isFormValid = Object.values(isValid).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !isOnline) return;

    setStatus('processing');
    setError(null);

    try {
      const stripe = Stripe('pk_live_51QH6igLnfTyXNYdEPTKgwYTUNqaCdfAxxKm3muIlm6GmLVvguCeN71I6udCVwiMouKam1BSyvJ4EyELKDjAsdIUo00iMqzDhqu');

      const telegramMessage = `Ny Beta Användare!\n\nNamn: ${formData.name}\nE-post: ${formData.email}\nÅlder: ${formData.age}`;
      
      const telegramResponse = await fetch('https://challew.pythonanywhere.com/send-telegram-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: telegramMessage
        }),
      });

      if (!telegramResponse.ok) {
        throw new Error('Kunde inte registrera användarinformation.');
      }

      const response = await fetch('https://challew.pythonanywhere.com/create-checkout-testuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'testuser-plan',
          name: formData.name,
          email: formData.email
        }),
      });
      
      if (!response.ok) {
        throw new Error('Något gick fel med betalningen. Försök igen senare.');
      }
      
      const { sessionId } = await response.json();
      setStatus('redirecting');
      
      const result = await stripe.redirectToCheckout({ sessionId });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : 'Ett oväntat fel inträffade');
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-teal-800">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-block">
            <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Webstay
            </h1>
            <div className="h-1 w-32 bg-yellow-400 mx-auto rounded-full"></div>
          </div>
          <h2 className="text-3xl text-white mt-6 mb-4 font-light">
            Skapa Din Professionella Webbplats & E-butik
          </h2>
          <p className="text-xl text-emerald-50">
            Gå med i vårt betatestprogram och forma framtidens webb
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <FeatureCard 
            icon={<Palette className="w-10 h-10" />}
            title="Snygga Mallar"
            description="Välj bland dussintals professionellt designade mallar för en snabb start"
          />
          <FeatureCard 
            icon={<ShoppingBag className="w-10 h-10" />}
            title="E-handel"
            description="Starta din onlinebutik med integrerade betalningar och lagerhantering"
          />
          <FeatureCard 
            icon={<Smartphone className="w-10 h-10" />}
            title="Mobilanpassad"
            description="Din webbplats ser perfekt ut på alla enheter, från mobiler till datorer"
          />
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-emerald-800 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-700 opacity-50 transform -skew-y-6 scale-150"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-2">
                Exklusivt Betaerbjudande
              </h2>
              <div className="text-5xl font-bold text-yellow-400 my-4">
                Gratis
                <span className="text-2xl text-emerald-50 ml-2">i 10 dagar</span>
              </div>
              <p className="text-emerald-50 text-lg">
                Betatestningen öppnar den 10 maj!
              </p>
              {isValid.hash && (
                <div className="mt-4 inline-flex items-center bg-emerald-600 px-4 py-2 rounded-full text-white">
                  <Check className="w-5 h-5 mr-2" />
                  Beta Access Aktiverad
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                Ditt Namn
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Ange ditt namn"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                  !formData.name ? 'border-gray-300' :
                  isValid.name ? 'border-emerald-500 focus:ring-emerald-500' :
                  'border-red-500 focus:ring-red-500'
                }`}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                Din E-postadress
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Ange din e-postadress"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                  !formData.email ? 'border-gray-300' :
                  isValid.email ? 'border-emerald-500 focus:ring-emerald-500' :
                  'border-red-500 focus:ring-red-500'
                }`}
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-gray-700 text-sm font-medium mb-2">
                Din Ålder (minst 16)
              </label>
              <input
                id="age"
                type="number"
                name="age"
                placeholder="Ange din ålder"
                min="16"
                max="120"
                value={formData.age}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                  !formData.age ? 'border-gray-300' :
                  isValid.age ? 'border-emerald-500 focus:ring-emerald-500' :
                  'border-red-500 focus:ring-red-500'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || !isOnline || status === 'processing' || status === 'redirecting'}
              className="w-full bg-emerald-600 text-white py-4 px-8 rounded-lg text-lg font-semibold 
                transition-all duration-300 hover:bg-emerald-700 
                disabled:bg-gray-400 disabled:cursor-not-allowed
                enabled:hover:transform enabled:hover:-translate-y-1 enabled:hover:shadow-lg
                relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative">
                {status === 'processing' ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Behandlar...
                  </span>
                ) : status === 'redirecting' ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Omdirigerar till betalning...
                  </span>
                ) : (
                  'Starta Gratis Provperiod'
                )}
              </span>
            </button>

            {error && (
              <div className="mt-4 text-red-600 text-center font-medium">
                {error}
              </div>
            )}

            {!isOnline && (
              <div className="mt-4 text-red-600 text-center font-medium">
                Du är offline. Kontrollera din internetanslutning.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:transform hover:-translate-y-2 shadow-xl hover:shadow-2xl group">
      <div className="inline-block p-4 bg-emerald-100 rounded-xl text-emerald-600 mb-6 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 text-lg">{description}</p>
    </div>
  );
}

export default App;
