// Currency pair data for programmatic SEO pages
// 80+ currencies → 5000+ unique pairs

export const CURRENCY_LIST = [
  { code: "USD", name: "US Dollar", country: "United States", symbol: "$" },
  { code: "EUR", name: "Euro", country: "Eurozone", symbol: "€" },
  { code: "GBP", name: "British Pound", country: "United Kingdom", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", country: "Japan", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", country: "Switzerland", symbol: "CHF" },
  { code: "AUD", name: "Australian Dollar", country: "Australia", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", country: "Canada", symbol: "C$" },
  { code: "NZD", name: "New Zealand Dollar", country: "New Zealand", symbol: "NZ$" },
  { code: "CNY", name: "Chinese Yuan", country: "China", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", country: "India", symbol: "₹" },
  { code: "SGD", name: "Singapore Dollar", country: "Singapore", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", country: "Hong Kong", symbol: "HK$" },
  { code: "KRW", name: "South Korean Won", country: "South Korea", symbol: "₩" },
  { code: "BRL", name: "Brazilian Real", country: "Brazil", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", country: "Mexico", symbol: "Mex$" },
  { code: "ZAR", name: "South African Rand", country: "South Africa", symbol: "R" },
  { code: "SEK", name: "Swedish Krona", country: "Sweden", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", country: "Norway", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", country: "Denmark", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", country: "Poland", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", country: "Czech Republic", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", country: "Hungary", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", country: "Romania", symbol: "lei" },
  { code: "TRY", name: "Turkish Lira", country: "Turkey", symbol: "₺" },
  { code: "RUB", name: "Russian Ruble", country: "Russia", symbol: "₽" },
  { code: "THB", name: "Thai Baht", country: "Thailand", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", country: "Malaysia", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", country: "Indonesia", symbol: "Rp" },
  { code: "PHP", name: "Philippine Peso", country: "Philippines", symbol: "₱" },
  { code: "VND", name: "Vietnamese Dong", country: "Vietnam", symbol: "₫" },
  { code: "TWD", name: "New Taiwan Dollar", country: "Taiwan", symbol: "NT$" },
  { code: "AED", name: "UAE Dirham", country: "UAE", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", country: "Saudi Arabia", symbol: "﷼" },
  { code: "QAR", name: "Qatari Riyal", country: "Qatar", symbol: "﷼" },
  { code: "KWD", name: "Kuwaiti Dinar", country: "Kuwait", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", country: "Bahrain", symbol: "BD" },
  { code: "OMR", name: "Omani Rial", country: "Oman", symbol: "﷼" },
  { code: "ILS", name: "Israeli Shekel", country: "Israel", symbol: "₪" },
  { code: "EGP", name: "Egyptian Pound", country: "Egypt", symbol: "E£" },
  { code: "NGN", name: "Nigerian Naira", country: "Nigeria", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", country: "Kenya", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", country: "Ghana", symbol: "₵" },
  { code: "TZS", name: "Tanzanian Shilling", country: "Tanzania", symbol: "TSh" },
  { code: "UGX", name: "Ugandan Shilling", country: "Uganda", symbol: "USh" },
  { code: "MAD", name: "Moroccan Dirham", country: "Morocco", symbol: "MAD" },
  { code: "CLP", name: "Chilean Peso", country: "Chile", symbol: "CLP$" },
  { code: "COP", name: "Colombian Peso", country: "Colombia", symbol: "COL$" },
  { code: "PEN", name: "Peruvian Sol", country: "Peru", symbol: "S/" },
  { code: "ARS", name: "Argentine Peso", country: "Argentina", symbol: "ARS$" },
  { code: "UYU", name: "Uruguayan Peso", country: "Uruguay", symbol: "$U" },
  { code: "BOB", name: "Bolivian Boliviano", country: "Bolivia", symbol: "Bs" },
  { code: "PYG", name: "Paraguayan Guarani", country: "Paraguay", symbol: "₲" },
  { code: "DOP", name: "Dominican Peso", country: "Dominican Republic", symbol: "RD$" },
  { code: "CRC", name: "Costa Rican Colón", country: "Costa Rica", symbol: "₡" },
  { code: "GTQ", name: "Guatemalan Quetzal", country: "Guatemala", symbol: "Q" },
  { code: "HNL", name: "Honduran Lempira", country: "Honduras", symbol: "L" },
  { code: "JMD", name: "Jamaican Dollar", country: "Jamaica", symbol: "J$" },
  { code: "TTD", name: "Trinidad Dollar", country: "Trinidad", symbol: "TT$" },
  { code: "PKR", name: "Pakistani Rupee", country: "Pakistan", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", country: "Bangladesh", symbol: "৳" },
  { code: "LKR", name: "Sri Lankan Rupee", country: "Sri Lanka", symbol: "Rs" },
  { code: "NPR", name: "Nepalese Rupee", country: "Nepal", symbol: "₨" },
  { code: "MMK", name: "Myanmar Kyat", country: "Myanmar", symbol: "K" },
  { code: "KHR", name: "Cambodian Riel", country: "Cambodia", symbol: "៛" },
  { code: "LAK", name: "Lao Kip", country: "Laos", symbol: "₭" },
  { code: "BND", name: "Brunei Dollar", country: "Brunei", symbol: "B$" },
  { code: "FJD", name: "Fijian Dollar", country: "Fiji", symbol: "FJ$" },
  { code: "PGK", name: "Papua New Guinean Kina", country: "Papua New Guinea", symbol: "K" },
  { code: "XAF", name: "CFA Franc BEAC", country: "Central Africa", symbol: "FCFA" },
  { code: "XOF", name: "CFA Franc BCEAO", country: "West Africa", symbol: "CFA" },
  { code: "BGN", name: "Bulgarian Lev", country: "Bulgaria", symbol: "лв" },
  { code: "HRK", name: "Croatian Kuna", country: "Croatia", symbol: "kn" },
  { code: "ISK", name: "Icelandic Króna", country: "Iceland", symbol: "kr" },
  { code: "GEL", name: "Georgian Lari", country: "Georgia", symbol: "₾" },
  { code: "AMD", name: "Armenian Dram", country: "Armenia", symbol: "֏" },
  { code: "AZN", name: "Azerbaijani Manat", country: "Azerbaijan", symbol: "₼" },
  { code: "KZT", name: "Kazakhstani Tenge", country: "Kazakhstan", symbol: "₸" },
  { code: "UZS", name: "Uzbekistani Som", country: "Uzbekistan", symbol: "сўм" },
];

export interface CurrencyPair {
  from: string;
  to: string;
  slug: string; // e.g., "usd-to-inr"
  title: string;
  description: string;
}

export function getCurrencyByCode(code: string) {
  return CURRENCY_LIST.find((c) => c.code === code);
}

export function generateAllPairs(): CurrencyPair[] {
  const pairs: CurrencyPair[] = [];
  for (const from of CURRENCY_LIST) {
    for (const to of CURRENCY_LIST) {
      if (from.code === to.code) continue;
      pairs.push({
        from: from.code,
        to: to.code,
        slug: `${from.code.toLowerCase()}-to-${to.code.toLowerCase()}`,
        title: `Convert ${from.name} to ${to.name} (${from.code}/${to.code})`,
        description: `Convert ${from.code} to ${to.code} with live exchange rates. 1 ${from.name} (${from.code}) to ${to.name} (${to.code}) conversion calculator with historical data.`,
      });
    }
  }
  return pairs;
}

export function parsePairSlug(slug: string): { from: string; to: string } | null {
  const match = slug.match(/^([a-z]{3})-to-([a-z]{3})$/);
  if (!match) return null;
  const from = match[1].toUpperCase();
  const to = match[2].toUpperCase();
  if (!getCurrencyByCode(from) || !getCurrencyByCode(to)) return null;
  if (from === to) return null;
  return { from, to };
}
