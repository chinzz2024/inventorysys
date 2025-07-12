# In api/urls.py
from django.urls import path
# Import the new view
from .views import ProductCreateAPI, ProductListAPI, StockUpdateAPI, StockReportAPI, ProductDeleteAPI

urlpatterns = [
    path('products/create/', ProductCreateAPI.as_view(), name='product-create'),
    path('products/', ProductListAPI.as_view(), name='product-list'),
    
    # Add the new URL pattern for deleting a specific product by its ID
    path('products/<uuid:product_id>/', ProductDeleteAPI.as_view(), name='product-delete'),
    
    path('stock/update/<uuid:variant_id>/', StockUpdateAPI.as_view(), name='stock-update'),
    path('report/stock/', StockReportAPI.as_view(), name='stock-report'),
]