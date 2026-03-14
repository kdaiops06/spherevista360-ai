// Inflation data for programmatic SEO pages

export interface InflationEntry {
  slug: string;
  country: string;
  countryCode: string;
  currentRate: number;
  targetRate: number;
  centralBank: string;
  currency: string;
}

export const INFLATION_DATA: InflationEntry[] = [
  { slug: "united-states-inflation-rate", country: "United States", countryCode: "US", currentRate: 3.1, targetRate: 2.0, centralBank: "Federal Reserve", currency: "USD" },
  { slug: "united-kingdom-inflation-rate", country: "United Kingdom", countryCode: "GB", currentRate: 4.0, targetRate: 2.0, centralBank: "Bank of England", currency: "GBP" },
  { slug: "eurozone-inflation-rate", country: "Eurozone", countryCode: "EU", currentRate: 2.8, targetRate: 2.0, centralBank: "European Central Bank", currency: "EUR" },
  { slug: "japan-inflation-rate", country: "Japan", countryCode: "JP", currentRate: 2.6, targetRate: 2.0, centralBank: "Bank of Japan", currency: "JPY" },
  { slug: "india-inflation-rate", country: "India", countryCode: "IN", currentRate: 5.1, targetRate: 4.0, centralBank: "Reserve Bank of India", currency: "INR" },
  { slug: "china-inflation-rate", country: "China", countryCode: "CN", currentRate: 0.7, targetRate: 3.0, centralBank: "People's Bank of China", currency: "CNY" },
  { slug: "germany-inflation-rate", country: "Germany", countryCode: "DE", currentRate: 2.9, targetRate: 2.0, centralBank: "ECB (Bundesbank)", currency: "EUR" },
  { slug: "france-inflation-rate", country: "France", countryCode: "FR", currentRate: 3.1, targetRate: 2.0, centralBank: "ECB (Banque de France)", currency: "EUR" },
  { slug: "canada-inflation-rate", country: "Canada", countryCode: "CA", currentRate: 2.9, targetRate: 2.0, centralBank: "Bank of Canada", currency: "CAD" },
  { slug: "australia-inflation-rate", country: "Australia", countryCode: "AU", currentRate: 3.4, targetRate: 2.5, centralBank: "Reserve Bank of Australia", currency: "AUD" },
  { slug: "brazil-inflation-rate", country: "Brazil", countryCode: "BR", currentRate: 4.5, targetRate: 3.0, centralBank: "Central Bank of Brazil", currency: "BRL" },
  { slug: "mexico-inflation-rate", country: "Mexico", countryCode: "MX", currentRate: 4.7, targetRate: 3.0, centralBank: "Bank of Mexico", currency: "MXN" },
  { slug: "south-korea-inflation-rate", country: "South Korea", countryCode: "KR", currentRate: 3.2, targetRate: 2.0, centralBank: "Bank of Korea", currency: "KRW" },
  { slug: "indonesia-inflation-rate", country: "Indonesia", countryCode: "ID", currentRate: 2.6, targetRate: 3.0, centralBank: "Bank Indonesia", currency: "IDR" },
  { slug: "turkey-inflation-rate", country: "Turkey", countryCode: "TR", currentRate: 65.0, targetRate: 5.0, centralBank: "Central Bank of Turkey", currency: "TRY" },
  { slug: "argentina-inflation-rate", country: "Argentina", countryCode: "AR", currentRate: 211.0, targetRate: 5.0, centralBank: "BCRA", currency: "ARS" },
  { slug: "south-africa-inflation-rate", country: "South Africa", countryCode: "ZA", currentRate: 5.3, targetRate: 4.5, centralBank: "South African Reserve Bank", currency: "ZAR" },
  { slug: "russia-inflation-rate", country: "Russia", countryCode: "RU", currentRate: 7.4, targetRate: 4.0, centralBank: "Central Bank of Russia", currency: "RUB" },
  { slug: "nigeria-inflation-rate", country: "Nigeria", countryCode: "NG", currentRate: 28.9, targetRate: 9.0, centralBank: "Central Bank of Nigeria", currency: "NGN" },
  { slug: "pakistan-inflation-rate", country: "Pakistan", countryCode: "PK", currentRate: 28.3, targetRate: 7.0, centralBank: "State Bank of Pakistan", currency: "PKR" },
  { slug: "egypt-inflation-rate", country: "Egypt", countryCode: "EG", currentRate: 33.7, targetRate: 7.0, centralBank: "Central Bank of Egypt", currency: "EGP" },
  { slug: "thailand-inflation-rate", country: "Thailand", countryCode: "TH", currentRate: 1.1, targetRate: 2.5, centralBank: "Bank of Thailand", currency: "THB" },
  { slug: "singapore-inflation-rate", country: "Singapore", countryCode: "SG", currentRate: 3.7, targetRate: 2.0, centralBank: "Monetary Authority of Singapore", currency: "SGD" },
  { slug: "switzerland-inflation-rate", country: "Switzerland", countryCode: "CH", currentRate: 1.7, targetRate: 2.0, centralBank: "Swiss National Bank", currency: "CHF" },
  { slug: "sweden-inflation-rate", country: "Sweden", countryCode: "SE", currentRate: 4.4, targetRate: 2.0, centralBank: "Sveriges Riksbank", currency: "SEK" },
  { slug: "norway-inflation-rate", country: "Norway", countryCode: "NO", currentRate: 3.9, targetRate: 2.0, centralBank: "Norges Bank", currency: "NOK" },
  { slug: "new-zealand-inflation-rate", country: "New Zealand", countryCode: "NZ", currentRate: 4.7, targetRate: 2.0, centralBank: "Reserve Bank of New Zealand", currency: "NZD" },
  { slug: "malaysia-inflation-rate", country: "Malaysia", countryCode: "MY", currentRate: 1.8, targetRate: 3.0, centralBank: "Bank Negara Malaysia", currency: "MYR" },
  { slug: "philippines-inflation-rate", country: "Philippines", countryCode: "PH", currentRate: 4.1, targetRate: 3.0, centralBank: "Bangko Sentral ng Pilipinas", currency: "PHP" },
  { slug: "colombia-inflation-rate", country: "Colombia", countryCode: "CO", currentRate: 9.3, targetRate: 3.0, centralBank: "Banco de la República", currency: "COP" },
];

export function getInflationBySlug(slug: string): InflationEntry | undefined {
  return INFLATION_DATA.find((e) => e.slug === slug);
}
