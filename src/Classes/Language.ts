// src/LanguageManager.ts
import { language as en } from '../languages/en.js'
import { language as ar } from '../languages/ar.js'
import { language as fr } from '../languages/fr.js'
// Add more imports as needed

export enum LanguagesList {
  English = 'en',
  Arabic = 'ar',
  French = 'fr',
}

export class Language {
  private static languages = {
    en,
    ar,
    fr,
  }
  static initialLanguage = this.languages.en

  static languageList = LanguagesList
  currentLanguage: LanguagesList

  constructor(language: LanguagesList) {
    this.currentLanguage = language
  }
  getCurrentName() {
    return this.currentLanguage
  }

  setCurrent(language: LanguagesList) {
    this.currentLanguage = language
  }

  get current() {
    return Language.languages[this.currentLanguage]
  }

  getNextLanguage() {
    if (this.currentLanguage === LanguagesList.English) {
      return LanguagesList.Arabic
    } else if (this.currentLanguage === LanguagesList.Arabic) {
      return LanguagesList.French
    } else return LanguagesList.English
  }

  // Dynamically load language files (optional: depends on your structure)
  static async loadLanguageFile(language: LanguagesList) {
    const languageFile = await import(`../../languages/${language}.ts`)
    this.languages[language] = languageFile.language // Assuming each file exports `language`
  }
}
