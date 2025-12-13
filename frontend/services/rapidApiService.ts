// This service is deprecated.
// The application now uses services/scraperService.ts for web scraping.

export const fetchFromRapidApi = async () => {
    throw new Error("RapidAPI Service is disabled.");
};

export const isRapidApiConfigured = () => false;
