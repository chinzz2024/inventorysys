// In src/components/ProductList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaMinus, FaTrash, FaBoxOpen, FaImage } from 'react-icons/fa';

// This is the reusable card component for each product.
const ProductCard = ({ product, quantities, onQuantityChange, onStockUpdate, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const variantsToShow = isExpanded ? product.variants : product.variants.slice(0, 2);

    const getStockPillClass = (stock) => {
        if (stock > 10) return 'stock-high';
        if (stock > 0) return 'stock-low';
        return 'stock-out';
    };

    return (
        <div className="product-item">
            <div className="product-card-image-container">
                {product.ProductImage ? (
                    <img src={`http://127.0.0.1:8000${product.ProductImage}`} alt={product.ProductName} className="product-image" />
                ) : (
                    <div className="no-image-placeholder"><FaImage /></div>
                )}
            </div>

            {/* The header now ONLY contains the product info */}
            <div className="product-header">
                <div className="info">
                    <h3 title={product.ProductName}>{product.ProductName}</h3>
                    <p title={product.ProductCode}>Code: {product.ProductCode}</p>
                </div>
            </div>

            <div className="product-body">
                <ul className="variant-list">
                    {variantsToShow.map(variant => (
                        <li key={variant.id}>
                            <span className="variant-info">{variant.name} - Stock: {variant.stock}</span>
                            <div className="stock-management-form">
                                <input type="number" placeholder="Qty" value={quantities[variant.id] || ''}
                                    onChange={(e) => onQuantityChange(variant.id, e.target.value)} min="1" />
                                <button className="purchase-btn" title="Purchase Stock" onClick={() => onStockUpdate(variant.id, 'add')}><FaPlus /></button>
                                <button className="sell-btn" title="Sell Stock" onClick={() => onStockUpdate(variant.id, 'remove')}><FaMinus /></button>
                            </div>
                        </li>
                    ))}
                </ul>
                {product.variants.length > 2 && (
                    <button className="show-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Show Less' : `Show ${product.variants.length - 2} more...`}
                    </button>
                )}
            </div>

            {/* --- NEW: The Product Footer for actions and status --- */}
            <div className="product-footer">
                <button className="action-btn" title="Delete Product" onClick={() => onDelete(product.id)}>
                    <FaTrash />
                </button>
                <div className={`stock-pill ${getStockPillClass(product.total_stock)}`}>
                    {product.total_stock || 0} in stock
                </div>
            </div>
        </div>
    );
};


// --- The rest of the file remains unchanged ---
function ProductList() {
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/products/');
            setProducts(response.data);
        } catch (error) {
            toast.error("Could not fetch products.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        setIsLoading(true);
        fetchProducts();
    }, []);

    const handleQuantityChange = (variantId, value) => {
        const numValue = parseInt(value, 10);
        setQuantities(prev => ({ 
            ...prev, 
            [variantId]: isNaN(numValue) ? '' : numValue 
        }));
    };

    const handleStockUpdate = async (variantId, action) => {
        const quantity = quantities[variantId] || 0;
        if (quantity <= 0) {
            toast.error("Please enter a quantity greater than 0.");
            return;
        }
        const verb = action === 'add' ? 'Purchasing' : 'Selling';
        const loadingToast = toast.loading(`${verb} stock...`);
        try {
            await axios.post(`http://127.0.0.1:8000/api/stock/update/${variantId}/`, {
                quantity: quantity, action: action
            });
            toast.success('Stock updated successfully!', { id: loadingToast });
            fetchProducts();
            handleQuantityChange(variantId, '');
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to update stock.";
            toast.error(errorMessage, { id: loadingToast });
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            const loadingToast = toast.loading('Deleting product...');
            try {
                await axios.delete(`http://127.0.0.1:8000/api/products/${productId}/`);
                toast.success('Product deleted!', { id: loadingToast });
                setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));
            } catch (error) {
                toast.error("Failed to delete product.", { id: loadingToast });
            }
        }
    };

    if (isLoading) {
        return <div className="loader-container"><div className="spinner"></div><p>Loading Products...</p></div>;
    }
    
    return (
        <div>
            <h1 className="page-header">Product List</h1>
            {products.length === 0 ? (
                <div className="empty-state">
                    <FaBoxOpen className="empty-state-icon" />
                    <h2>No Products Found</h2>
                    <p>Get started by adding your first product.</p>
                    <Link to="/create"><button><FaPlus/> Create Product</button></Link>
                </div>
            ) : (
                <div className="product-list-container">
                    {products.map(product => (
                        <ProductCard 
                            key={product.id}
                            product={product}
                            quantities={quantities}
                            onQuantityChange={handleQuantityChange}
                            onStockUpdate={handleStockUpdate}
                            onDelete={handleDeleteProduct}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductList;