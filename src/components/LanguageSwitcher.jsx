import { useTranslation } from "react-i18next"
import { IoLanguage } from "react-icons/io5"
import { useState, useRef, useEffect } from "react"

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 dark:text-gray-200"
      >
        <IoLanguage className="w-5 h-5" />
        <span className="hidden sm:inline">
          {languages.find((lang) => lang.code === i18n.language)?.label || "English"}
        </span>
        <span className="inline sm:hidden">{i18n.language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                i18n.language === language.code
                  ? "bg-finance-blue-50 dark:bg-finance-blue-900/30 text-finance-blue-600 dark:text-finance-blue-400"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher;

