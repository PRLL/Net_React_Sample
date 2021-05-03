import i18next from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import I18NextHttpBackend from "i18next-http-backend";
import { format as formatDate, formatDistanceToNow, isDate } from "date-fns";
import { en, es } from "date-fns/locale";

const locales = { en, es };

i18next.use(I18NextHttpBackend).use(I18nextBrowserLanguageDetector).init({
    fallbackLng: 'es',
    debug: false,
    detection: {
        order: ['queryString', 'cookie'],
        cache: ['cookie'],
    },
    interpolation: {
        format: (value, format) => {
            if (isDate(value)) {
                const locale = locales[i18next.language];
                switch (format) {
                    case "detail":
                        return formatDate(value, "dd MMM yyyy h:mm aa", { locale });
                    case "store":
                        return formatDate(value, "dd MMM yyyy", { locale });
                    case "distance":
                        return formatDistanceToNow(value, { locale });
                    case "daymonth":
                        return formatDate(value, 'do LLL', { locale });
                    case "hour":
                        return formatDate(value, 'h:mm a', { locale });
                    default:
                        return formatDate(value, format, { locale });
                }
            } else {
                return value;
            }
        },
        escapeValue: false
    }
});

export default i18next;