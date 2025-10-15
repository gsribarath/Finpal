import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import hi from './locales/hi/translation.json';
import ta from './locales/ta/translation.json';
import te from './locales/te/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
