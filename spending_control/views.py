from urllib.parse import urlparse

from django_filters.views import FilterView

from spending_control.models import Spending
from spending_control.filters import SpendingFilter


class SpendingListView(FilterView):
    template_name = 'spending_control/spending_list.html'
    context_object_name = 'spendings'
    queryset = Spending.objects.all() # añadir ordenar por fecha de creación
    filterset_class = SpendingFilter
    # agregar paginacion de 10 elementos por página
    

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        parse_url = urlparse(self.request.build_absolute_uri())
        base_url = parse_url.scheme + "://" + parse_url.netloc + parse_url.path
        base_url += '?page=1'

        
        # agregar el siguiente listado de filtros al context de la vista
        """ 
        [
            {'label': 'Ver todos', 'url': base_url},
            {'label': 'Pendiente de estado de cuenta',
                'url': f'{base_url}&account_status=False'},
            {'label': 'Pendiente de factura', 'url': f'{base_url}&invoice=False'},
            {'label': 'Pendiente de conocimiento firmado',
                'url': f'{base_url}&liquidation_certificate=False'},
        ]
        """
        
        return context

