export interface TmhmRelated {
    id: number;
    naam: string;
    omschrijving: string;
    /**
     * Comma-separated string of related IDs (as in the original object).
     * Consider parsing this into an array of numbers for easier use.
     */
    relacionados: string;
}