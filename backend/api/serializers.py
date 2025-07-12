# In api/serializers.py
from rest_framework import serializers
from .models import Products, Variant, StockTransaction

class VariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variant
        fields = ['id', 'name', 'stock']

# --- MODIFIED: Add total_stock field ---
class ProductSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, read_only=True)
    # This new field will hold the calculated total stock
    total_stock = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Products
        # Make sure to include the new field in the list
        fields = ['id', 'ProductID', 'ProductCode', 'ProductName', 'ProductImage', 'CreatedDate', 'UpdatedDate', 'CreatedUser', 'IsFavourite', 'Active', 'HSNCode', 'total_stock', 'variants']


class StockTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='variant.product.ProductName', read_only=True)
    product_is_active = serializers.BooleanField(source='variant.product.Active', read_only=True)
    class Meta:
        model = StockTransaction
        fields = ['id', 'timestamp', 'variant', 'transaction_type', 'quantity', 'product_name', 'product_is_active']