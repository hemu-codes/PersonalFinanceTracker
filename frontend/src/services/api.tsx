import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface Stock {
    id?: number;
    ticker: string;
    companyName: string;
    shares: number;
    purchasePrice: number;
    purchaseDate: string;
}

interface StockPrice {
    ticker: string;
    currentPrice: number;
    change: number;
    percentChange: number;
}

export const stockApi = {
    // Get all stocks
    getAllStocks: async (): Promise<Stock[]> => {
        const response = await axios.get<Stock[]>(`${API_BASE_URL}/stocks`);
        return response.data;
    },

    // Add a new stock
    addStock: async (stock: Omit<Stock, 'id'>): Promise<Stock> => {
        const response = await axios.post<Stock>(`${API_BASE_URL}/stocks`, stock);
        return response.data;
    },

    // Delete a stock
    deleteStock: async (id: number): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/stocks/${id}`);
    },

    // Get current stock price
    getStockPrice: async (ticker: string): Promise<StockPrice> => {
        const response = await axios.get<StockPrice>(`${API_BASE_URL}/stocks/${ticker}/price`);
        return response.data;
    },
};

export type { Stock, StockPrice };