# In api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser # New Import
import random 
import itertools
from datetime import datetime, time
from django.contrib.auth.models import User
from django.db.models import Sum
from .models import Products, Variant, StockTransaction
from .serializers import ProductSerializer, StockTransactionSerializer

class ProductCreateAPI(APIView):
    # This new line is required for file uploads
    parser_classes = [MultiPartParser, FormParser] 

    def post(self, request):
        user = User.objects.first() 
        if not user:
            user = User.objects.create_user('defaultuser', 'test@example.com', 'password')
        
        # When sending files, other data comes as strings. We need to handle this.
        import json
        product_name = request.data.get("name")
        image = request.data.get("image") # Get the image file
        variants_data_str = request.data.get("variants", "[]")
        
        try:
            variants_data = json.loads(variants_data_str)
        except json.JSONDecodeError:
            return Response({"error": "Invalid variants format."}, status=status.HTTP_400_BAD_REQUEST)

        if not product_name or not variants_data:
            return Response({"error": "Product name and variants are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the product, now including the image
        product = Products.objects.create(
            ProductName=product_name,
            ProductCode=f"{product_name.replace(' ', '-')}-{random.randint(1000, 9999)}",
            ProductID=random.randint(100000, 999999),
            CreatedUser=user,
            ProductImage=image # Assign the uploaded file
        )
        
        option_groups = [v['options'] for v in variants_data]
        all_combinations = list(itertools.product(*option_groups))
        for combination in all_combinations:
            variant_name = " / ".join(combination)
            Variant.objects.create(product=product, name=variant_name, stock=0)
        
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# --- All other API classes below this line remain exactly the same ---
# (ProductListAPI, StockUpdateAPI, StockReportAPI, ProductDeleteAPI)
class ProductListAPI(APIView):
    def get(self, request):
        products = Products.objects.filter(Active=True).annotate(
            total_stock=Sum('variants__stock')
        )
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
class StockUpdateAPI(APIView):
    def post(self, request, variant_id):
        try:
            variant = Variant.objects.get(id=variant_id)
        except Variant.DoesNotExist:
            return Response({"error": "Variant not found"}, status=status.HTTP_404_NOT_FOUND)
        quantity = int(request.data.get("quantity", 0))
        action = request.data.get("action")
        if action == "add":
            variant.stock += quantity
            StockTransaction.objects.create(variant=variant, transaction_type='purchase', quantity=quantity)
        elif action == "remove":
            if variant.stock < quantity:
                return Response({"error": "Not enough stock"}, status=status.HTTP_400_BAD_REQUEST)
            variant.stock -= quantity
            StockTransaction.objects.create(variant=variant, transaction_type='sale', quantity=quantity)
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        variant.save()
        return Response({"success": f"Stock updated successfully. New stock: {variant.stock}"})
class StockReportAPI(APIView):
    def get(self, request):
        transactions = StockTransaction.objects.all().order_by('timestamp')
        start_date_str = request.query_params.get('start_date', None)
        end_date_str = request.query_params.get('end_date', None)
        if start_date_str:
            transactions = transactions.filter(timestamp__gte=start_date_str)
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            end_datetime = datetime.combine(end_date, time.max)
            transactions = transactions.filter(timestamp__lte=end_datetime)
        serializer = StockTransactionSerializer(transactions, many=True)
        return Response(serializer.data)
class ProductDeleteAPI(APIView):
    def delete(self, request, product_id):
        try:
            product = Products.objects.get(id=product_id)
            product.Active = False
            product.save()
            return Response({"success": "Product marked as inactive."}, status=status.HTTP_200_OK)
        except Products.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)