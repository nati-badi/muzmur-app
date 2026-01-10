
const MONTH_NAMES_EN = [
  "Meskerem", "Tikimt", "Hedar", "Tahsas", 
  "Tir", "Yekatit", "Megabit", "Miyazya", 
  "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

const HOLIDAY_DATA = {
  "source": "Ethiopian Orthodox Tewahedo Church Synaxarium (Sinkessar)",
  
  "monthly_default_cycle": {
    "1": {
        en: "Lideta Mariam (Birth of Mary), St. Raguel, St. Bartholomew",
        am: "ልደታ ማርያም፣ ቅዱስ ራጉኤል፣ ቅዱስ በርተሎሜዎስ",
        details: {
            am: "እመቤታችን ቅድስት ድንግል ማርያም የተወለደችበት ዕለት ነው።",
            en: "The day commemorating the birth of our Lady Saint Mary."
        }
    },
    "2": {
        en: "St. Thaddeus the Apostle, St. Job",
        am: "ቅዱስ ታዴዎስ ሐዋርያ፣ ኢዮብ"
    },
    "3": {
        en: "Ba'ata Mariam (Entry of Mary into the Temple)",
        am: "በአታ ማርያም",
        details: {
            am: "እመቤታችን ንፅህናዋ ተጠብቆ እንዲኖር በሦስት ዓመቷ ወደ ቤተ መቅደስ የገባችበት ዕለት ነው።",
            en: "Commemoration of the entry of Saint Mary into the Temple at the age of three."
        }
    },
    "4": {
        en: "Yohannes (John the Son of Thunder/Evangelist)",
        am: "ዮሐንስ ወልደ ነጎድጓድ"
    },
    "5": {
        en: "Abune Gebre Menfas Kidus (Abo), St. Peter and St. Paul",
        am: "አቡነ ገብረ መንፈስ ቅዱስ፣ ጴጥሮስና ጳውሎስ"
    },
    "6": {
        en: "Iyesus (Our Lady of Qusquam)",
        am: "ኢየሱስ (ቁስቋም ማርያም)"
    },
    "7": {
        en: "Kidist Selassie (Holy Trinity)",
        am: "ቅድስት ሥላሴ"
    },
    "8": {
        en: "Abba Kiros, Arbaetu Ensesat (Four Living Creatures)",
        am: "አባ ኪሮስ፣ አርባዕቱ እንስሳ"
    },
    "9": {
        en: "Salome, The 318 Fathers of Nicaea",
        am: "ሰሎሜ፣ ሠለስቱ ምዕት (318ቱ ሊቃውንት)"
    },
    "10": {
        en: "Meskel (The Holy Cross)",
        am: "ተዘከረ መስቀሉ"
    },
    "11": {
        en: "Hanna and Iyachim (Parents of Mary), St. Yared",
        am: "ሐና እና ኢያቄም፣ ቅዱስ ያሬድ"
    },
    "12": {
        en: "Kidus Mikael (Archangel Michael)",
        am: "ቅዱስ ሚካኤል",
        details: {
            am: "ቅዱስ ሚካኤል ሕዝበ እስራኤልን ከግብፅ ባርነት የመራበትና ባሕረ ኤርትራን የከፈለበት ዕለት ነው።",
            en: "Archangel Michael's monthly feast, commemorating his leadership of the Israelites out of Egypt."
        }
    },
    "13": {
        en: "Egziabher Ab (God the Father), Kidus Ruphael (Archangel Raphael)",
        am: "እግዚአብሔር አብ፣ ቅዱስ ሩፋኤል"
    },
    "14": {
        en: "Abune Aregawi, Gebre Kristos",
        am: "አቡነ አረጋዊ፣ ገብረ ክርስቶስ"
    },
    "15": {
        en: "Kidus Kirkos and his mother Iyeluta",
        am: "ቅዱስ ቂርቆስ እና ኢየሉጣ"
    },
    "16": {
        en: "Kidane Mehret (Covenant of Mercy)",
        am: "ኪዳነ ምሕረት"
    },
    "17": {
        en: "Kidus Estifanos (Stephen the First Martyr)",
        am: "ቅዱስ እስጢፋኖስ"
    },
    "18": {
        en: "Abune Ewostatewos",
        am: "አቡነ ኤዎስጣቴዎስ"
    },
    "19": {
        en: "Kidus Gabriel (Archangel Gabriel)",
        am: "ቅዱስ ገብርኤል",
        details: {
            am: "ቅዱስ ገብርኤል ሠለስቱ ደቂቅን (ሦስቱን ወጣቶች) ከሚነድ እሳት ያዳነበት ዕለት ነው።",
            en: "The day Archangel Gabriel saved the three youths from the furnace."
        }
    },
    "20": {
        en: "Hnstata (Building of the Church of Mary)",
        am: "ሕንፀተ ቤተክርስቲያን"
    },
    "21": {
        en: "Kidist Mariam (St. Mary - Commemoration of death/assumption)",
        am: "እግዝእትነ ማርያም (ዘመላእክት)"
    },
    "22": {
        en: "Kidus Urael (Archangel Uriel), St. Deksius",
        am: "ቅዱስ ዑራኤል፣ ቅዱስ ደቅስዮስ"
    },
    "23": {
        en: "Kidus Giorgis (St. George)",
        am: "ቅዱስ ጊዮርጊስ"
    },
    "24": {
        en: "Abune Tekle Haymanot, 24 Heavenly Priests",
        am: "አቡነ ተክለ ሃይማኖት፣ ፳፬ቱ ካህናተ ሰማይ"
    },
    "25": {
        en: "Kidus Merkorios (St. Mercurius)",
        am: "ቅዱስ መርቆሬዎስ"
    },
    "26": {
        en: "Kidus Yoseph (Joseph), St. Thomas",
        am: "ቅዱስ ዮሴፍ፣ ቅዱስ ቶማስ"
    },
    "27": {
        en: "Medhane Alem (Savior of the World)",
        am: "መድኃኔዓለም",
        details: {
            am: "ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ ለዓለም ድኅነት በዕፀ መስቀል ላይ የፈጸመው የማዳን ሥራ ይታሰባል::",
            en: "Commemorating the saving work of our Lord Jesus Christ for the salvation of the world."
        }
    },
    "28": {
        en: "Amanuel (Emmanuel)",
        am: "አማኑኤል"
    },
    "29": {
        en: "Bale Wold (Feast of the Son)",
        am: "በዓለ ወልድ (ባልወልድ)"
    },
    "30": {
        en: "Kidus Markos (St. Mark), Yohannes (John the Baptist)",
        am: "ቅዱስ ማርቆስ፣ ዮሐንስ መጥምቅ",
        details: {
            am: "ቅዱስ ማርቆስ ወንጌላዊ እና ዮሐንስ መጥምቅ የሚታሰቡበት ዕለት ነው።",
            en: "The day commemorating St. Mark the Evangelist and John the Baptist."
        }
    }
  },

  "annual_major_feasts": {
    "Meskerem_01": {
        en: "Enkutatash (Ethiopian New Year), St. John the Baptist",
        am: "እንቁጣጣሽ (አዲስ ዓመት)፣ ዮሐንስ መጥምቅ"
    },
    "Meskerem_10": {
        en: "Tsege (Feast of Flowers - Season begins)",
        am: "ጦቤርዮስ (ጽጌ)"
    },
    "Meskerem_17": {
        en: "Meskel (Finding of the True Cross) - MAJOR FEAST",
        am: "መስቀል (የደምራ በዓል)",
        details: {
            am: "ንግሥት እሌኒ በጸሎትና በሱባኤ የእውነተኛውን መስቀል የተቀበረበትን ቦታ ያገኘችበትን ዕለት ለማስታወስ ይከበራል።",
            en: "Celebrated to commemorate the finding of the True Cross by Queen Helena."
        }
    },
    "Meskerem_21": {
        en: "Gishen Mariam",
        am: "ግሸን ማርያም (ደብረ ከርቤ)"
    },
    
    "Tikimt_14": {
        en: "Abune Aregawi (Annual Great Feast)",
        am: "አቡነ አረጋዊ (ዓመታዊ በዓል)"
    },
    "Tikimt_17": {
        en: "Estifanos (Annual Feast)",
        am: "ቅዱስ እስጢፋኖስ (ዓመታዊ በዓል)"
    },
    "Tikimt_27": {
        en: "Medhane Alem (Annual Great Feast)",
        am: "መድኃኔዓለም (ዓመታዊ በዓል)"
    },
    
    "Hedar_06": {
        en: "Qusquam (Return from Egypt) - MAJOR FEAST",
        am: "ቁስቋም (ማርያም)"
    },
    "Hedar_12": {
        en: "Kidus Mikael (Exodus of Israel) - MAJOR FEAST",
        am: "ቅዱስ ሚካኤል (ህዳር ሚካኤል)"
    },
    "Hedar_21": {
        en: "Tsion Mariam (St. Mary of Zion/Axum) - MAJOR FEAST",
        am: "ጽዮን ማርያም"
    },
    
    "Tahsas_03": {
        en: "Ba'ata Mariam (Annual Feast)",
        am: "በአታ ለኢየሩሳሌም"
    },
    "Tahsas_19": {
        en: "Kidus Gabriel (Annual Feast / Kulubi) - MAJOR FEAST",
        am: "ቅዱስ ገብርኤል (ቁልቢ)"
    },
    "Tahsas_22": {
        en: "Kidus Deksius",
        am: "ቅዱስ ደቅስዮስ"
    },
    "Tahsas_28": {
        en: "Gena Eve (Christmas Eve)",
        am: "የገና ዋዜማ"
    },
    "Tahsas_29": {
        en: "Gena (Nativity of Christ) - MAJOR FEAST",
        am: "በዓለ ገና (ልደት)",
        details: {
            am: "ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ በቤተልሔም የተወለደበት ታላቅ የደስታ ዕለት ነው።",
            en: "The joyful day commemorating the birth of our Lord and Savior Jesus Christ in Bethlehem."
        }
    },
    
    "Tir_11": {
        en: "Timket (Epiphany/Baptism) - MAJOR FEAST",
        am: "ጥምቀት",
        details: {
            am: "ጌታችን በዮርዳኖስ ባሕር በዮሐንስ እጅ ለመጠመቁ መታሰቢያ የሚከበር ታላቅ በዓል ነው።",
            en: "The great feast commemorating the baptism of our Lord in the Jordan River by John."
        }
    },
    "Tir_12": {
        en: "Kana ZeGalila (Cana of Galilee)",
        am: "ቃና ዘገሊላ"
    },
    "Tir_21": {
        en: "Asteriyo Mariam (Dormition/Appearance of Mary) - MAJOR FEAST",
        am: "አስተርዮ ማርያም"
    },
    
    "Yekatit_16": {
        en: "Kidane Mehret (Annual Feast) - MAJOR FEAST",
        am: "ኪዳነ ምሕረት (የካቲት 16)"
    },
    
    "Megabit_10": {
        en: "Meskel (Finding of the Cross - Spring commemoration)",
        am: "መስቀል (መጋቢት)"
    },
    "Megabit_27": {
        en: "Medhane Alem (Annual Feast)",
        am: "መድኃኔዓለም (ጥንተ ስቅለቱ)"
    },
    "Megabit_29": {
        en: "Bale Wold (Conception of Christ) - MAJOR FEAST",
        am: "በዓለ ወልድ (ጽንሰት)"
    },
    
    "Miyazya_23": {
        en: "Kidus Giorgis (Annual Feast) - MAJOR FEAST",
        am: "ቅዱስ ጊዮርጊስ (ሚያዚያ 23)",
        details: {
            am: "ታላቁ ሰማዕት ቅዱስ ጊዮርጊስ በሰማዕትነት ያለፈበት ዓመታዊ በዓል ነው።",
            en: "The annual feast commemorating the martyrdom of the great martyr Saint George."
        }
    },
    
    "Ginbot_01": {
        en: "Lideta Mariam (Birth of Mary) - MAJOR FEAST",
        am: "ልደታ ለማርያም"
    },
    "Ginbot_12": {
        en: "Kidus Michael (deliverance of Bahiran)",
        am: "ቅዱስ ሚካኤል (ግንቦት 12)"
    },
    "Ginbot_20": {
        en: "Gish Abbay (St. Michael)",
        am: "ግሽ አባይ (ሚካኤል)"
    },
    
    "Sene_12": {
        en: "Kidus Mikael (Annual Feast) - MAJOR FEAST",
        am: "ሰኔ ሚካኤል"
    },
    "Sene_20": {
        en: "Hnstata (Building of the First Church of Mary)",
        am: "ሕንፀተ ቤተክርስቲያን"
    },
    "Sene_21": {
        en: "Virgin Mary (Dedication of her Church)",
        am: "ቅድስት ድንግል ማርያም (ሰኔ 21)"
    },
    
    "Hamle_05": {
        en: "Petros and Paulos",
        am: "ጴጥሮስ ወጳውሎስ"
    },
    "Hamle_19": {
        en: "Kidus Gabriel (Annual Feast) - MAJOR FEAST",
        am: "ቅዱስ ገብርኤል (ሐምሌ 19)"
    },
    
    "Nehase_13": {
        en: "Debre Tabor (Transfiguration of Jesus) - MAJOR FEAST",
        am: "ደብረ ታቦር (ቡሄ)"
    },
    "Nehase_16": {
        en: "Filseta (Assumption of Mary) - MAJOR FEAST",
        am: "ፍልሰታ ለማርያም"
    },
    "Nehase_24": {
        en: "Abune Tekle Haymanot (Annual Feast) - MAJOR FEAST",
        am: "አቡነ ተክለ ሃይማኖት (ነሐሴ 24)"
    },
    
    "Pagume_03": {
        en: "Kidus Ruphael (Archangel Raphael) - Annual Feast",
        am: "ቅዱስ ሩፋኤል (ጳጉሜ)"
    },
    "Pagume_05": {
        en: "Gishen Mariam",
        am: "ግሸን ማርያም"
    }
  }
};

/**
 * Returns the feast info for a specific Ethiopian date
 * @param {number} month - 1-13
 * @param {number} day - 1-30
 * @returns {Object} { monthly: {en, am}, major: {en, am}|null }
 */
const getFeastForDate = (month, day) => {
  const monthName = MONTH_NAMES_EN[month - 1];
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const key = `${monthName}_${dayStr}`;
  
  const monthly = HOLIDAY_DATA.monthly_default_cycle[day.toString()];
  const major = HOLIDAY_DATA.annual_major_feasts[key] || null;
  
  return { monthly, major };
};

module.exports = {
  getFeastForDate
};
