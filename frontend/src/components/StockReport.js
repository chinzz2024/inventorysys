// In src/components/StockReport.js
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- STYLES DEFINED HERE ---
// We keep your main container and background image styles
const reportContainerStyle = {
  maxWidth: '800px',
  margin: '20px auto',
  padding: '0', // Padding will be handled by the content div now
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-lg)',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'var(--light-color)',
};

const reportBackgroundStyle = {
  content: '""',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url('${process.env.PUBLIC_URL}/form-background-vintage.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'blur(1px) brightness(0.8)',
  zIndex: 1,
};

// --- THIS IS THE KEY STYLE CHANGE FOR READABILITY ---
const reportContentStyle = {
  position: 'relative',
  zIndex: 2,
  // This dark, semi-transparent overlay makes the light text pop
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '2rem',
};

const textShadowStyle = {
  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)',
};

const darkInputStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  color: 'var(--light-color)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
};

function StockReport() {
    // Your state and logic remain the same
    const [transactions, setTransactions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleFetchReport = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select both a Start Date and an End Date.");
            return;
        }
        setHasSearched(true); 
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/report/stock/', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                }
            });
            setTransactions(response.data);
            if (response.data.length === 0) {
              toast.success("No transactions found for the selected period.");
            }
        } catch (error) {
            console.error("Error fetching stock report:", error);
            toast.error('Failed to fetch report.');
        }
    };

    return (
        <div style={reportContainerStyle}>
            <div style={reportBackgroundStyle}></div>
            <div style={reportContentStyle}> {/* The content is now wrapped in the overlay */}
                <h2 style={textShadowStyle}>Stock Transaction Report</h2>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={textShadowStyle}>Start Date:</label>
                        <input style={darkInputStyle} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={textShadowStyle}>End Date:</label>
                        <input style={darkInputStyle} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <button onClick={handleFetchReport} style={{ alignSelf: 'flex-end' }}>
                        Get Report
                    </button>
                </div>
                
                <table className="report-table" style={{ background: 'rgba(0, 0, 0, 0.2)', border: 'none' }}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Product (Variant ID)</th>
                            <th>Type</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hasSearched ? (
                            transactions.length > 0 ? (
                                // --- THIS IS THE KEY CHANGE FOR RECENT-FIRST ORDER ---
                                transactions.slice().reverse().map(t => (
                                    <tr key={t.id} className={!t.product_is_active ? 'deleted-row' : ''}>
                                        <td>{new Date(t.timestamp).toLocaleString()}</td>
                                        <td>{t.product_name} ({t.variant})</td>
                                        <td style={{ textTransform: 'capitalize' }}>{t.transaction_type}</td>
                                        {/* Bonus: Colored text for quantity */}
                                        <td style={{ color: t.transaction_type === 'sale' ? '#ff8a80' : '#b9f6ca', fontWeight: 'bold' }}>
                                            {t.transaction_type === 'sale' ? `-${t.quantity}` : `+${t.quantity}`}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No transactions found for the selected period.</td>
                                </tr>
                            )
                        ) : (
                            <tr>
                               <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.7)' }}>Select a date range and click "Get Report".</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StockReport;