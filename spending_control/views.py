from urllib.parse import urlparse

from django_filters.views import FilterView

from spending_control.models import Spending
from spending_control.filters import SpendingFilter


class SpendingListView(FilterView):
    template_name = 'spending_control/spending_list.html'
    context_object_name = 'spendings'

    #  Ordenar por fecha de creación (más recientes primero)
    queryset = Spending.objects.all().order_by('-created_at')

    #  Filtro avanzado con django-filter
    filterset_class = SpendingFilter

    #  Paginación de 10 elementos por página
    paginate_by = 10

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Obtener la URL base para agregarle los filtros
        parse_url = urlparse(self.request.build_absolute_uri())
        base_url = parse_url.scheme + "://" + parse_url.netloc + parse_url.path
        base_url += '?page=1'

        #  Agregar listado de filtros personalizados al context
        context['filters'] = [
            {'label': 'Ver todos', 'url': base_url},
            {'label': 'Pendiente de estado de cuenta', 'url': f'{base_url}&account_status='},
            {'label': 'Pendiente de factura', 'url': f'{base_url}&invoice='},
            {'label': 'Pendiente de conocimiento firmado', 'url': f'{base_url}&liquidation_certificate='},
        ]

        return context
