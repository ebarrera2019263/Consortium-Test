from django.contrib import admin

from spending_control.models import Spending


class LiquidationInline(admin.TabularInline):
    model = Spending.liquidations.through
    extra = 1


# Agregar el modelo Spending al panel de administración y agregar el inline LiquidationInline
