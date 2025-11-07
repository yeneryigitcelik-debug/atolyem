"use client";

import { useEffect } from "react";

// Client-side slug oluşturma fonksiyonu
function generateSlug(text: string): string {
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
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SlugGenerator() {
  useEffect(() => {
    const titleInput = document.getElementById("title") as HTMLInputElement;
    const slugInput = document.getElementById("slug") as HTMLInputElement;

    if (!titleInput || !slugInput) return;

    let isManualSlugEdit = false;
    let lastTitleValue = titleInput.value;

    // Slug input'a manuel müdahale olup olmadığını takip et
    slugInput.addEventListener("input", () => {
      isManualSlugEdit = true;
    });

    // Title değiştiğinde slug'u otomatik oluştur (sadece manuel düzenlenmemişse)
    titleInput.addEventListener("input", () => {
      const currentTitle = titleInput.value;
      
      // Eğer slug boşsa veya son title'dan oluşturulmuşsa, güncelle
      if (!isManualSlugEdit || slugInput.value === generateSlug(lastTitleValue) || slugInput.value === "") {
        slugInput.value = generateSlug(currentTitle);
        isManualSlugEdit = false; // Otomatik oluşturuldu, manuel düzenleme flag'ini sıfırla
      }
      
      lastTitleValue = currentTitle;
    });

    // İlk yüklemede slug boşsa, title'dan oluştur
    if (slugInput.value === "" && titleInput.value) {
      slugInput.value = generateSlug(titleInput.value);
    }
  }, []);

  return null;
}

