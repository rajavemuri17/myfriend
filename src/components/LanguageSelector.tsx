import { useState, useMemo } from 'react';
import { Globe, Check, Search, Sparkles, Filter } from 'lucide-react';
import { LanguageOption } from '../types';

export const ALL_LANGUAGES: LanguageOption[] = [
  // Europe & Americas
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', greeting: 'Hello, I am right here with you.', flag: '🇺🇸', region: 'Europe & Americas' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', greeting: 'Lovely to meet you, take a slow breath.', flag: '🇬🇧', region: 'Europe & Americas' },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English (Australia)', greeting: 'G\'day, take your time, I am listening.', flag: '🇦🇺', region: 'Europe & Americas' },
  { code: 'en-CA', name: 'English (Canada)', nativeName: 'English (Canada)', greeting: 'Hello there, how are you feeling today?', flag: '🇨🇦', region: 'Europe & Americas' },
  { code: 'en-IE', name: 'English (Ireland)', nativeName: 'English (Ireland)', greeting: 'Welcome, take it easy and speak freely.', flag: '🇮🇪', region: 'Europe & Americas' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', greeting: 'Hola, aquí estoy para acompañarte con cariño.', flag: '🇪🇸', region: 'Europe & Americas' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', greeting: 'Hola, cuéntame con calma, aquí te escucho.', flag: '🇲🇽', region: 'Europe & Americas' },
  { code: 'es-AR', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)', greeting: 'Hola, relajate y contame lo que sentís.', flag: '🇦🇷', region: 'Europe & Americas' },
  { code: 'es-CO', name: 'Spanish (Colombia)', nativeName: 'Español (Colombia)', greeting: 'Hola, tómate un momento y hablemos tranquilos.', flag: '🇨🇴', region: 'Europe & Americas' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)', greeting: 'Bonjour, je suis là pour vous écouter en douceur.', flag: '🇫🇷', region: 'Europe & Americas' },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français (Canada)', greeting: 'Allô, prends ton temps, je t\'écoute avec soin.', flag: '🇨🇦', region: 'Europe & Americas' },
  { code: 'de-DE', name: 'German (Germany)', nativeName: 'Deutsch (Deutschland)', greeting: 'Hallo, ich bin ganz ruhig für dich da.', flag: '🇩🇪', region: 'Europe & Americas' },
  { code: 'de-AT', name: 'German (Austria)', nativeName: 'Deutsch (Österreich)', greeting: 'Servus, nimm dir Zeit, ich höre dir zu.', flag: '🇦🇹', region: 'Europe & Americas' },
  { code: 'de-CH', name: 'German (Switzerland)', nativeName: 'Deutsch (Schweiz)', greeting: 'Grüezi, chum in Rueh a, ich bi da für dich.', flag: '🇨🇭', region: 'Europe & Americas' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', greeting: 'Ciao, sono qui con dolcezza e serenità.', flag: '🇮🇹', region: 'Europe & Americas' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', greeting: 'Oi, estou aqui com todo o carinho para você.', flag: '🇧🇷', region: 'Europe & Americas' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', greeting: 'Olá, respire fundo, estou aqui consigo.', flag: '🇵🇹', region: 'Europe & Americas' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', greeting: 'Hallo, ik ben er rustig voor je.', flag: '🇳🇱', region: 'Europe & Americas' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', greeting: 'Hej, ta det lugnt, jag finns här för dig.', flag: '🇸🇪', region: 'Europe & Americas' },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', greeting: 'Hei, ta et dypt pust, jeg er her for deg.', flag: '🇳🇴', region: 'Europe & Americas' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', greeting: 'Hej, tag det helt roligt, jeg lytter til dig.', flag: '🇩🇰', region: 'Europe & Americas' },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', greeting: 'Hei, hengähdä rauhassa, olen täällä sinua varten.', flag: '🇫🇮', region: 'Europe & Americas' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', greeting: 'Cześć, weź głęboki oddech, spokojnie cię wysłucham.', flag: '🇵🇱', region: 'Europe & Americas' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', greeting: 'Привіт, я поруч і готовий спокійно тебе вислухати.', flag: '🇺🇦', region: 'Europe & Americas' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', greeting: 'Здравствуй, я рядом и готов спокойно тебя выслушать.', flag: '🇷🇺', region: 'Europe & Americas' },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', greeting: 'Γεια σας, είμαι εδώ δίπλα σας με ηρεμία.', flag: '🇬🇷', region: 'Europe & Americas' },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', greeting: 'Ahoj, v klidu se nadechni, jsem tu pro tebe.', flag: '🇨🇿', region: 'Europe & Americas' },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română', greeting: 'Bună, respiră liniștit, sunt aici alături de tine.', flag: '🇷🇴', region: 'Europe & Americas' },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', greeting: 'Szia, vegyél egy mély levegőt, itt vagyok melletted.', flag: '🇭🇺', region: 'Europe & Americas' },
  { code: 'bg-BG', name: 'Bulgarian', nativeName: 'Български', greeting: 'Здравей, поеми си дъх, аз съм тук за теб.', flag: '🇧🇬', region: 'Europe & Americas' },
  { code: 'sk-SK', name: 'Slovak', nativeName: 'Slovenčina', greeting: 'Ahoj, pokojne dýchaj, som tu s tebou.', flag: '🇸🇰', region: 'Europe & Americas' },
  { code: 'hr-HR', name: 'Croatian', nativeName: 'Hrvatski', greeting: 'Bok, polako udahni, tu sam za tebe.', flag: '🇭🇷', region: 'Europe & Americas' },
  { code: 'sr-RS', name: 'Serbian', nativeName: 'Српски', greeting: 'Здраво, опусти се, ту сам да те саслушам.', flag: '🇷🇸', region: 'Europe & Americas' },
  { code: 'sl-SI', name: 'Slovenian', nativeName: 'Slovenščina', greeting: 'Živijo, v miru zadihaj, tukaj sem zate.', flag: '🇸🇮', region: 'Europe & Americas' },
  { code: 'lt-LT', name: 'Lithuanian', nativeName: 'Lietuvių', greeting: 'Labas, giliai įkvėpk, aš esu čia dėl tavęs.', flag: '🇱🇹', region: 'Europe & Americas' },
  { code: 'lv-LV', name: 'Latvian', nativeName: 'Latviešu', greeting: 'Sveiks, mierīgi ieelpo, es esmu šeit ar tevi.', flag: '🇱🇻', region: 'Europe & Americas' },
  { code: 'et-EE', name: 'Estonian', nativeName: 'Eesti', greeting: 'Tere, hinga rahulikult, ma olen siin sinu jaoks.', flag: '🇪🇪', region: 'Europe & Americas' },
  { code: 'is-IS', name: 'Icelandic', nativeName: 'Íslenska', greeting: 'Halló, andaðu rólega, ég er hér fyrir þig.', flag: '🇮🇸', region: 'Europe & Americas' },
  { code: 'ga-IE', name: 'Irish Gaelic', nativeName: 'Gaeilge', greeting: 'Dia duit, tóg go bog é, tá mé anseo leat.', flag: '🇮🇪', region: 'Europe & Americas' },
  { code: 'gd-GB', name: 'Scottish Gaelic', nativeName: 'Gàidhlig', greeting: 'Halò, gabh fois, tha mi an seo dhut.', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', region: 'Europe & Americas' },
  { code: 'cy-GB', name: 'Welsh', nativeName: 'Cymraeg', greeting: 'Helo, cymer anadl dawel, rwyf yma gyda thi.', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', region: 'Europe & Americas' },
  { code: 'ca-ES', name: 'Catalan', nativeName: 'Català', greeting: 'Hola, respira tranquil·lament, soc aquí amb tu.', flag: '🇦🇩', region: 'Europe & Americas' },
  { code: 'eu-ES', name: 'Basque', nativeName: 'Euskara', greeting: 'Kaixo, hartu arnasa lasai, hemen nago zuretzat.', flag: '🇪🇸', region: 'Europe & Americas' },
  { code: 'gl-ES', name: 'Galician', nativeName: 'Galego', greeting: 'Ola, respira con calma, estou aquí contigo.', flag: '🇪🇸', region: 'Europe & Americas' },

  // East & Southeast Asia
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', greeting: 'こんにちは。いつでもそばにいますよ。', flag: '🇯🇵', region: 'East & SE Asia' },
  { code: 'zh-CN', name: 'Mandarin Chinese (Simplified)', nativeName: '简体中文', greeting: '你好，我一直在你身边，慢慢来。', flag: '🇨🇳', region: 'East & SE Asia' },
  { code: 'zh-TW', name: 'Mandarin Chinese (Traditional)', nativeName: '繁體中文', greeting: '你好，放鬆心情，我隨時在身邊陪伴你。', flag: '🇹🇼', region: 'East & SE Asia' },
  { code: 'zh-HK', name: 'Cantonese', nativeName: '廣東話 / 粵語', greeting: '你好，放鬆啲，我會一直聽你講。', flag: '🇭🇰', region: 'East & SE Asia' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', greeting: '안녕하세요, 편안하게 마음을 털어놓아 보세요.', flag: '🇰🇷', region: 'East & SE Asia' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', greeting: 'Xin chào, tôi luôn ở đây lắng nghe bạn.', flag: '🇻🇳', region: 'East & SE Asia' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', greeting: 'สวัสดีค่ะ ฉันอยู่ที่นี่เพื่อรับฟังคุณอย่างอบอุ่น', flag: '🇹🇭', region: 'East & SE Asia' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', greeting: 'Halo, saya di sini menemanimu dengan hangat.', flag: '🇮🇩', region: 'East & SE Asia' },
  { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', greeting: 'Helo, bertenanglah, saya sentiasa ada di sisi anda.', flag: '🇲🇾', region: 'East & SE Asia' },
  { code: 'fil-PH', name: 'Filipino / Tagalog', nativeName: 'Tagalog', greeting: 'Kamusta, nandito lang ako para makinig sa iyo.', flag: '🇵🇭', region: 'East & SE Asia' },
  { code: 'my-MM', name: 'Burmese', nativeName: 'မြန်မာစာ', greeting: 'မင်္ဂလာပါ၊ စိတ်အေးအေးထားပါ၊ သင့်အနားမှာ ရှိနေပါတယ်။', flag: '🇲🇲', region: 'East & SE Asia' },
  { code: 'km-KH', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', greeting: 'សួស្តី សូមសម្រាកចិត្ត ខ្ញុំនៅទីនេះជាមួយអ្នក។', flag: '🇰🇭', region: 'East & SE Asia' },
  { code: 'lo-LA', name: 'Lao', nativeName: 'ພາສາລາວ', greeting: 'ສະບາຍດີ, ພັກຜ່ອນໃຈ, ຂ້ອຍຢູ່ທີ່ນີ້ເພື່ອເຈົ້າ.', flag: '🇱🇦', region: 'East & SE Asia' },
  { code: 'mn-MN', name: 'Mongolian', nativeName: 'Монгол хэл', greeting: 'Сайн байна уу, тайвширч амьсгал аваарай.', flag: '🇲🇳', region: 'East & SE Asia' },

  // South Asia
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', greeting: 'नमस्ते, मैं हमेशा आपके साथ हूँ, शांति से बात करें।', flag: '🇮🇳', region: 'South Asia' },
  { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', greeting: 'নমস্কার, শান্তভাবে শ্বাস নিন, আমি আপনার পাশে আছি।', flag: '🇧🇩', region: 'South Asia' },
  { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', greeting: 'السلام علیکم، پُرسکون رہیں، میں آپ کے ساتھ ہوں۔', flag: '🇵🇰', region: 'South Asia' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', greeting: 'வணக்கம், அமைதியாக இருங்கள், நான் உங்களுடன் இருக்கிறேன்.', flag: '🇮🇳', region: 'South Asia' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', greeting: 'నమస్కారం, ప్రశాంతంగా ఉండండి, నేను మీతో ఉన్నాను.', flag: '🇮🇳', region: 'South Asia' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', greeting: 'नमस्कार, शांतपणे श्वास घ्या, मी तुमच्यासोबत आहे.', flag: '🇮🇳', region: 'South Asia' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', greeting: 'નમસ્તે, શાંતિથી વાત કરો, હું તમારી સાથે છું.', flag: '🇮🇳', region: 'South Asia' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', greeting: 'ನಮಸ್ಕಾರ, ಶಾಂತವಾಗಿರಿ, ನಾನು ನಿಮ್ಮೊಂದಿಗೆ ಇದ್ದೇನೆ.', flag: '🇮🇳', region: 'South Asia' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', greeting: 'നമസ്കാരം, സമാധാനമായി സംസാരിക്കൂ, ഞാൻ കൂടെയുണ്ട്.', flag: '🇮🇳', region: 'South Asia' },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਸ਼ਾਂਤ ਹੋਵੋ, ਮੈਂ ਤੁਹਾਡੇ ਨਾਲ ਹਾਂ।', flag: '🇮🇳', region: 'South Asia' },
  { code: 'ne-NP', name: 'Nepali', nativeName: 'नेपाली', greeting: 'नमस्ते, शान्त हुनुहोस्, म तपाईंसँग छु।', flag: '🇳🇵', region: 'South Asia' },
  { code: 'si-LK', name: 'Sinhala', nativeName: 'සිංහල', greeting: 'ආයුබෝවන්, සන්සුන් වන්න, මම ඔබ සමඟ සිටිමි.', flag: '🇱🇰', region: 'South Asia' },

  // Middle East & Africa
  { code: 'ar-SA', name: 'Arabic (Modern Standard)', nativeName: 'العربية (الفصحى)', greeting: 'أهلاً بك، أنا هنا لأستمع إليك بكل لطف وطمأنينة.', flag: '🇸🇦', region: 'Middle East & Africa' },
  { code: 'ar-EG', name: 'Arabic (Egyptian)', nativeName: 'العربية (مصر)', greeting: 'أهلاً بيك، خد نفس براحة خالص، أنا سامعك.', flag: '🇪🇬', region: 'Middle East & Africa' },
  { code: 'ar-AE', name: 'Arabic (Gulf)', nativeName: 'العربية (الخليج)', greeting: 'مرحبا بك، خذ راحتك، أنا معاك خطوة بخطوة.', flag: '🇦🇪', region: 'Middle East & Africa' },
  { code: 'fa-IR', name: 'Persian / Farsi', nativeName: 'فارسی', greeting: 'سلام، نفس عمیقی بکش، من کنارتم.', flag: '🇮🇷', region: 'Middle East & Africa' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', greeting: 'Merhaba, tüm şefkatimle buradayım.', flag: '🇹🇷', region: 'Middle East & Africa' },
  { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', greeting: 'שלום, קח נשימה עמוקה, אני כאן לצידך.', flag: '🇮🇱', region: 'Middle East & Africa' },
  { code: 'az-AZ', name: 'Azerbaijani', nativeName: 'Azərbaycan dili', greeting: 'Salam, rahat nəfəs al, mən yanındayam.', flag: '🇦🇿', region: 'Middle East & Africa' },
  { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', greeting: 'Jambo, vuta pumzi kwa amani, niko hapa nawe.', flag: '🇰🇪', region: 'Middle East & Africa' },
  { code: 'am-ET', name: 'Amharic', nativeName: 'አማርኛ', greeting: 'ሰላም၊ በረጋ መንፈስ ተንፍስ፣ እኔ ከአንተ ጋር ነኝ።', flag: '🇪🇹', region: 'Middle East & Africa' },
  { code: 'yo-NG', name: 'Yoruba', nativeName: 'Èdè Yorùbá', greeting: 'Báwo, simi pẹlẹ, mo wà níbí pẹ̀lú rẹ.', flag: '🇳🇬', region: 'Middle East & Africa' },
  { code: 'ha-NG', name: 'Hausa', nativeName: 'Harshen Hausa', greeting: 'Sannu, ka huta lafiya, ina tare da kai.', flag: '🇳🇬', region: 'Middle East & Africa' },
  { code: 'ig-NG', name: 'Igbo', nativeName: 'Asụsụ Igbo', greeting: 'Ndewo, nwee udo na obi gị, anọ m ebe a.', flag: '🇳🇬', region: 'Middle East & Africa' },
  { code: 'zu-ZA', name: 'Zulu', nativeName: 'isiZulu', greeting: 'Sawubona, phefumula ngokuthula, ngilapha nawe.', flag: '🇿🇦', region: 'Middle East & Africa' },
  { code: 'af-ZA', name: 'Afrikaans', nativeName: 'Afrikaans', greeting: 'Hallo, haal rustig asem, ek is hier vir jou.', flag: '🇿🇦', region: 'Middle East & Africa' },
];

const REGIONS = ['All', 'Europe & Americas', 'East & SE Asia', 'South Asia', 'Middle East & Africa'];

interface LanguageSelectorProps {
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageSelector({
  currentLanguage,
  onSelectLanguage,
  isOpen,
  onClose,
}: LanguageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [customInput, setCustomInput] = useState('');

  const filteredLanguages = useMemo(() => {
    return ALL_LANGUAGES.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedRegion === 'All' || l.region === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion]);

  if (!isOpen) return null;

  const handleSelect = (langName: string) => {
    onSelectLanguage(langName);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelectLanguage(customInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base sm:text-lg text-white">All World Languages</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300">
                  {ALL_LANGUAGES.length} Languages
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Serenade naturally adapts regional idioms, warmth, and cadence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3.5">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search any language, dialect, or native script (e.g. Japanese, العربية, Deutsch)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 ml-1" />
          {REGIONS.map((region) => {
            const isSelected = selectedRegion === region;
            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar min-h-[260px]">
          {filteredLanguages.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No language found matching "{searchTerm}". You can specify it manually below!
            </div>
          ) : (
            filteredLanguages.map((lang) => {
              const isSelected = currentLanguage.toLowerCase() === lang.name.toLowerCase();
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-sm'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <div>
                      <div className="font-medium text-xs sm:text-sm flex items-center gap-1.5">
                        {lang.name}
                        <span className="text-[11px] text-slate-400 font-normal">({lang.nativeName})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                        "{lang.greeting}"
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>

        {/* Custom Dialect / Language input */}
        <form onSubmit={handleCustomSubmit} className="mt-3 pt-3 border-t border-slate-800">
          <label className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Don't see your regional dialect? Type any language:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Bavarian, Swiss German, Shanghainese, Quechua..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-medium text-xs sm:text-sm rounded-xl transition cursor-pointer"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
