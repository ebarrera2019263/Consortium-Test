from django.contrib import admin
from .models import Spending

@admin.register(Spending)
class SpendingAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'type']
    search_fields = ['created_by__username']
