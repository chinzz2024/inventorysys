// In src/components/ProductForm.js
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa';

// --- STYLES DEFINED HERE ---
const formContainerStyle = {
  maxWidth: '700px',
  margin: '20px auto',
  padding: '2rem',
  borderRadius: 'var(--border-radius)',
  boxShadow: 'var(--shadow-lg)',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'var(--light-color)',
};

const formBackgroundStyle = {
  content: '""',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  // --- THIS IS THE ONLY CHANGE IN THIS STYLE OBJECT ---
  backgroundImage: `url('${process.env.PUBLIC_URL}/form-background-vintage.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  // Adjusted filter for the new, lighter background
  filter: 'blur(1px) brightness(0.8)', 
  zIndex: 1,
};

const formContentStyle = {
  position: 'relative',
  zIndex: 2,
};

const textShadowStyle = {
  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)',
};

const darkInputStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  color: 'var(--light-color)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
};


function ProductForm() {
    const [productName, setProductName] = useState('');
    const [variants, setVariants] = useState([{ name: '', options: '' }]);
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };
    
    const handleProductNameChange = (e) => {
        setProductName(e.target.value);
    };

    const handleVariantChange = (index, e) => {
        const newVariants = [...variants];
        newVariants[index][e.target.name] = e.target.value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { name: '', options: '' }]);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        const formData = new FormData();
        formData.append('name', productName);
        if (image) { formData.append('image', image); }
        const variantsPayload = variants.map(v => ({
            name: v.name,
            options: v.options.split(',').map(opt => opt.trim()).filter(opt => opt),
        })).filter(v => v.name && v.options.length > 0);
        formData.append('variants', JSON.stringify(variantsPayload));

        if (!productName || variantsPayload.length === 0) {
            return toast.error("Please provide a product name and at least one valid variant.");
        }

        const loadingToast = toast.loading('Creating product...');
        try {
            await axios.post('http://127.0.0.1:8000/api/products/create/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Product created successfully!', { id: loadingToast });
            setProductName('');
            setVariants([{ name: '', options: '' }]);
            setImage(null);
            document.getElementById('image-input').value = null;
        } catch (error) {
            toast.error('Failed to create product.', { id: loadingToast });
        }
    };

    return (
        <div style={formContainerStyle}>
            <div style={formBackgroundStyle}></div>
            <div style={formContentStyle}>
                <form onSubmit={handleSubmit}>
                    <h2 style={textShadowStyle}>Create a New Product</h2>
                    
                    <div className="form-group">
                        <label style={textShadowStyle}>Product Name</label>
                        <input style={darkInputStyle} type="text" value={productName} onChange={handleProductNameChange} placeholder="e.g., Premium Cotton T-Shirt" />
                    </div>

                    <div className="form-group">
                        <label style={textShadowStyle}>Product Image</label>
                        <input id="image-input" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    <h3 style={textShadowStyle}>Variants</h3>
                    {variants.map((variant, index) => (
                        <div key={index} className="form-group" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                            <label style={textShadowStyle}>Variant Type #{index + 1}</label>
                            <input style={{...darkInputStyle, marginBottom: '10px'}} type="text" name="name" placeholder="Variant Name (e.g., Size)" value={variant.name} onChange={(e) => handleVariantChange(index, e)} />
                            <input style={darkInputStyle} type="text" name="options" placeholder="Options, comma-separated (e.g., S, M, L)" value={variant.options} onChange={(e) => handleVariantChange(index, e)} />
                        </div>
                    ))}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                        <button type="button" className="sell-btn" onClick={addVariant}>
                            <FaPlus /> Add Variant
                        </button>
                        <button type="submit">Create Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductForm;