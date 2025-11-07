/**
 * Slug oluşturma ve temizleme fonksiyonları
 */

/**
 * Türkçe karakterleri İngilizce karşılıklarına çevirir
 */
function turkishToEnglish(text: string): string {
  const turkishChars: { [key: string]: string } = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    İ: "I",
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };

  return text
    .split("")
    .map((char) => turkishChars[char] || char)
    .join("");
}

/**
 * Metni slug formatına çevirir
 * Örnek: "El Yapımı Seramik Kase" -> "el-yapimi-seramik-kase"
 */
export function generateSlug(text: string): string {
  return turkishToEnglish(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Özel karakterleri kaldır
    .replace(/[\s_-]+/g, "-") // Boşlukları ve alt çizgileri tire ile değiştir
    .replace(/^-+|-+$/g, ""); // Başta ve sonda tire varsa kaldır
}

/**
 * Benzersiz slug oluşturur (eğer slug zaten varsa sonuna sayı ekler)
 * @param baseSlug - Temel slug
 * @param checkUnique - Slug'un benzersiz olup olmadığını kontrol eden fonksiyon
 * @returns Benzersiz slug
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkUnique: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (!(await checkUnique(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

