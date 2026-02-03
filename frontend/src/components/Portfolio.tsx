import { useState, useEffect } from 'react';
import { stockApi, type Stock} from '../services/api';

interface NewStock {
    ticker: string;
    companyName: string;
    shares: string;
    purchasePrice: string;
    purchaseDate: string;
}

interface StockWithPrice extends Stock {
    currentPrice?: number;
    gainLoss?: number;
    gainLossPercent?: number;
}

function Portfolio() {
    const [stocks, setStocks] = useState<StockWithPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newStock, setNewStock] = useState<NewStock>({
        ticker: '',
        companyName: '',
        shares: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().slice(0, 16)
    });

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const data = await stockApi.getAllStocks();

            // Fetch current prices for all stocks
            const stocksWithPrices = await Promise.all(
                data.map(async (stock) => {
                    try {
                        const priceData = await stockApi.getStockPrice(stock.ticker);
                        const currentValue = priceData.currentPrice * stock.shares;
                        const purchaseValue = stock.purchasePrice * stock.shares;
                        const gainLoss = currentValue - purchaseValue;
                        const gainLossPercent = ((currentValue - purchaseValue) / purchaseValue) * 100;

                        return {
                            ...stock,
                            currentPrice: priceData.currentPrice,
                            gainLoss,
                            gainLossPercent
                        };
                    } catch (error) {
                        console.error(`Failed to fetch price for ${stock.ticker}`, error);
                        return stock;
                    }
                })
            );

            setStocks(stocksWithPrices);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stocks:', error);
            setLoading(false);
        }
    };

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await stockApi.addStock({
                ticker: newStock.ticker,
                companyName: newStock.companyName,
                shares: parseInt(newStock.shares),
                purchasePrice: parseFloat(newStock.purchasePrice),
                purchaseDate: newStock.purchaseDate
            });
            setNewStock({
                ticker: '',
                companyName: '',
                shares: '',
                purchasePrice: '',
                purchaseDate: new Date().toISOString().slice(0, 16)
            });
            setShowForm(false);
            fetchStocks();
        } catch (error) {
            console.error('Error adding stock:', error);
        }
    };

    const handleDeleteStock = async (id: number) => {
        try {
            await stockApi.deleteStock(id);
            fetchStocks();
        } catch (error) {
            console.error('Error deleting stock:', error);
        }
    };

    const calculatePurchaseValue = (stock: Stock) => {
        return (stock.shares * stock.purchasePrice).toFixed(2);
    };

    const calculateCurrentValue = (stock: StockWithPrice) => {
        if (stock.currentPrice) {
            return (stock.shares * stock.currentPrice).toFixed(2);
        }
        return 'N/A';
    };

    const calculatePortfolioSummary = () => {
        let totalPurchaseValue = 0;
        let totalCurrentValue = 0;
        let bestStock = null;
        let worstStock = null;
        let maxGain = -Infinity;
        let minGain = Infinity;

        stocks.forEach(stock => {
            const purchaseValue = stock.shares * stock.purchasePrice;
            totalPurchaseValue += purchaseValue;

            if (stock.currentPrice) {
                const currentValue = stock.shares * stock.currentPrice;
                totalCurrentValue += currentValue;

                if (stock.gainLossPercent !== undefined) {
                    if (stock.gainLossPercent > maxGain) {
                        maxGain = stock.gainLossPercent;
                        bestStock = stock;
                    }
                    if (stock.gainLossPercent < minGain) {
                        minGain = stock.gainLossPercent;
                        worstStock = stock;
                    }
                }
            }
        });

        const totalGainLoss = totalCurrentValue - totalPurchaseValue;
        const totalGainLossPercent = totalPurchaseValue > 0
            ? (totalGainLoss / totalPurchaseValue) * 100
            : 0;

        return {
            totalPurchaseValue,
            totalCurrentValue,
            totalGainLoss,
            totalGainLossPercent,
            bestStock,
            worstStock
        };
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '32px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>My Portfolio</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    >
                        {showForm ? 'Cancel' : 'Add Stock'}
                    </button>
                </div>

                {/* Portfolio Summary Card */}
                {stocks.length > 0 && (() => {
                    const summary = calculatePortfolioSummary();
                    return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            {/* Total Value */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                padding: '24px'
                            }}>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                    Total Portfolio Value
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>
                                    ${summary.totalCurrentValue.toFixed(2)}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                    Initial: ${summary.totalPurchaseValue.toFixed(2)}
                                </div>
                            </div>

                            {/* Total Gain/Loss */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                padding: '24px'
                            }}>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                    Total Gain/Loss
                                </div>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: summary.totalGainLoss >= 0 ? '#10b981' : '#ef4444'
                                }}>
                                    {summary.totalGainLoss >= 0 ? '+' : ''}${summary.totalGainLoss.toFixed(2)}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    marginTop: '4px',
                                    color: summary.totalGainLoss >= 0 ? '#10b981' : '#ef4444'
                                }}>
                                    ({summary.totalGainLossPercent >= 0 ? '+' : ''}{summary.totalGainLossPercent.toFixed(2)}%)
                                </div>
                            </div>

                            {/* Best Performer */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                padding: '24px'
                            }}>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                    Best Performer
                                </div>
                                {summary.bestStock ? (
                                    <>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>
                                            {summary.bestStock.ticker}
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                                            +{summary.bestStock.gainLossPercent!.toFixed(2)}%
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ color: '#9ca3af' }}>N/A</div>
                                )}
                            </div>

                            {/* Worst Performer */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                padding: '24px'
                            }}>
                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                    Worst Performer
                                </div>
                                {summary.worstStock ? (
                                    <>
                                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>
                                            {summary.worstStock.ticker}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: summary.worstStock.gainLossPercent! < 0 ? '#ef4444' : '#10b981'
                                        }}>
                                            {summary.worstStock.gainLossPercent! >= 0 ? '+' : ''}
                                            {summary.worstStock.gainLossPercent!.toFixed(2)}%
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ color: '#9ca3af' }}>N/A</div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {showForm && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '24px',
                        marginBottom: '32px'
                    }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
                            Add New Stock
                        </h2>
                        <form onSubmit={handleAddStock}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                                        Ticker
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newStock.ticker}
                                        onChange={(e) => setNewStock({...newStock, ticker: e.target.value.toUpperCase()})}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="AAPL"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newStock.companyName}
                                        onChange={(e) => setNewStock({...newStock, companyName: e.target.value})}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="Apple Inc."
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                                        Shares
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={newStock.shares}
                                        onChange={(e) => setNewStock({...newStock, shares: e.target.value})}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="10"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                                        Purchase Price
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newStock.purchasePrice}
                                        onChange={(e) => setNewStock({...newStock, purchasePrice: e.target.value})}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            fontSize: '16px'
                                        }}
                                        placeholder="150.50"
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                                        Purchase Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={newStock.purchaseDate}
                                        onChange={(e) => setNewStock({...newStock, purchaseDate: e.target.value})}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                            >
                                Add to Portfolio
                            </button>
                        </form>
                    </div>
                )}

                {stocks.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '48px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#6b7280', fontSize: '18px' }}>
                            No stocks in your portfolio yet. Add your first stock!
                        </p>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f3f4f6' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Ticker</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Company</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Shares</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Purchase Price</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Current Price</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Purchase Value</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Current Value</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Gain/Loss</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {stocks.map((stock, index) => (
                                <tr key={stock.id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#2563eb' }}>
                                        {stock.ticker}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#374151' }}>
                                        {stock.companyName}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', color: '#374151' }}>
                                        {stock.shares}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', color: '#374151' }}>
                                        ${stock.purchasePrice.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                                        {stock.currentPrice ? `$${stock.currentPrice.toFixed(2)}` : 'Loading...'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', color: '#374151' }}>
                                        ${calculatePurchaseValue(stock)}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                                        ${calculateCurrentValue(stock)}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        {stock.gainLoss !== undefined ? (
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                backgroundColor: stock.gainLoss >= 0 ? '#10b981' : '#ef4444',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>
                                                <div style={{ fontSize: '16px' }}>
                                                    {stock.gainLoss >= 0 ? '+' : ''}${stock.gainLoss.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '12px' }}>
                                                    ({stock.gainLossPercent! >= 0 ? '+' : ''}{stock.gainLossPercent!.toFixed(2)}%)
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#9ca3af' }}>N/A</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleDeleteStock(stock.id!)}
                                            style={{
                                                color: '#ef4444',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                border: 'none',
                                                background: 'none',
                                                fontSize: '14px'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                                            onMouseOut={(e) => e.currentTarget.style.color = '#ef4444'}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Portfolio;