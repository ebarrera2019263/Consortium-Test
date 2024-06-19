from django.contrib import admin

from spending_control.models import Spending


class LiquidationInline(admin.TabularInline):
    model = Spending.liquidations.through
    extra = 1


@admin.register(Spending)
class SpendingAdmin(admin.ModelAdmin):
    inlines = [LiquidationInline]
    exclude = ('liquidations',)
