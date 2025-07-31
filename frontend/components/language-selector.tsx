import { LANGUAGES } from "@/lib/constants";

interface LanguageSelectorProps {
    language: string;
    setLanguage: (language: string) => void;
}

export default function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
    return (
        <select value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="editor-language-selector"
        aria-label="Select programming language">
        {LANGUAGES.map((language, index) => (
          <option className="editor-language-item" value={language.value} key={index}>{language.name}</option>
        ))}
      </select>
    );
}