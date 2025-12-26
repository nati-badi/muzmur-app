import mezmursData from '../data/mezmurs.json';

// Section definitions for Mezmurs
export const SECTIONS = {
  BAPTISM: 'የከተራና የጥምቀት መዝሙራት',
  CANA: 'የቃና ዘገሊላ መዝሙራት',
  THANKSGIVING: 'የመድኃኔዓለም የምስጋና መዝሙራት',
  MARY: 'የእመቤታችን የምስጋና መዝሙራት',
  MICHAEL: 'የቅዱስ ሚካኤል መዝሙራት',
  GABRIEL: 'የቅዱስ ገብርኤል መዝሙራት',
  TEKLE_HAYMANOT: 'የአቡነ ተክለ ሃይማኖት መዝሙራት',
  GEORGE: 'የቅዱስ ጊዮርጊስ መዝሙራት',
  GEBRE_MENFES_KIDUS: 'የአቡነ ገብረ መንፈስ ቅዱስ መዝሙራት',
  CHURCH: 'ስለ ቅድስት ቤተ ክርስቲያን መዝሙራት',
  STEPHEN: 'ስለ ቀዳሜ ሰማዕት እስጢፋኖስ መዝሙራት',
  JOHN_CHRYSOSTOM: 'ስለ ቅዱስ ዮሐንስ አፈወርቅ መዝሙራት',
  ETHIOPIA: 'ስለ ሀገራችን ኢትዮጵያ መዝሙራት',
  ABA_GARIMA: 'ስለ አባ ገሪማ',
  ARSEMA: 'ስለ ቅድስት አርሴማ መዝሙራት',
  PHILIP: 'ስለ ቅዱስ ፊልጶስ መዝሙራት',
};

// Map ID ranges to sections
export const getSectionById = (id) => {
  const numId = parseInt(id);
  
  if (numId >= 1 && numId <= 91) return SECTIONS.BAPTISM;
  if (numId >= 92 && numId <= 98) return SECTIONS.CANA;
  if (numId >= 99 && numId <= 147) return SECTIONS.THANKSGIVING;
  if (numId >= 148 && numId <= 187) return SECTIONS.MARY;
  if (numId >= 188 && numId <= 214) return SECTIONS.MICHAEL;
  if (numId >= 215 && numId <= 220) return SECTIONS.GABRIEL;
  if (numId >= 221 && numId <= 225) return SECTIONS.TEKLE_HAYMANOT;
  if (numId >= 226 && numId <= 227) return SECTIONS.GEORGE;
  if (numId >= 228 && numId <= 230) return SECTIONS.GEBRE_MENFES_KIDUS;
  if (numId >= 231 && numId <= 234) return SECTIONS.CHURCH;
  if (numId === 235) return SECTIONS.STEPHEN;
  if (numId === 236) return SECTIONS.JOHN_CHRYSOSTOM;
  if (numId === 237) return SECTIONS.ETHIOPIA;
  if (numId === 238) return SECTIONS.ABA_GARIMA;
  if (numId === 239) return SECTIONS.ARSEMA;
  if (numId >= 240 && numId <= 242) return SECTIONS.PHILIP;
  
  return SECTIONS.BAPTISM; // Default
};

// Get all section names as array
// export const getAllSections = () => Object.values(SECTIONS);
export const getAllSections = () => {
  return Array.from(new Set(
    mezmursData.map(m => m.section).filter(Boolean)
  ));
};
