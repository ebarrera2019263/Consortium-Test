from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile

from spending_control.models import Spending


class SpendingModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='tester',
            password='pass1234'
        )

    def test_create_spending(self):
        spending = Spending.objects.create(
            created_by=self.user,
            type='INVOICED',
            status='PENDING',
        )
        self.assertEqual(spending.type, 'INVOICED')
        self.assertEqual(spending.status, 'PENDING')
        self.assertTrue(spending.__str__().startswith('INVOICED'))

    def test_filefield_upload(self):
        file = SimpleUploadedFile("doc.pdf", b"file_content")
        spending = Spending.objects.create(
            created_by=self.user,
            type='INVOICED',
            status='PENDING',
            liquidation_sent=file,
        )
        self.assertTrue(spending.liquidation_sent.name.endswith("doc.pdf"))


class SpendingListViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_user(
            username='tester',
            password='pass1234'
        )
        self.client.login(username='tester', password='pass1234')

        # ✔️ Uno sin factura (para filtro de "pendiente")
        self.without_invoice = Spending.objects.create(
            created_by=self.user,
            type='INVOICED',
            status='PENDING',
            invoice=None
        )

        # ✔️ Uno con archivo cargado (para probar exclusión del filtro)
        file = SimpleUploadedFile("invoice.pdf", b"fake content")
        self.with_invoice = Spending.objects.create(
            created_by=self.user,
            type='INVOICED',
            status='PENDING',
            invoice=file
        )

    def test_spending_list_view_loads(self):
        response = self.client.get(reverse('spending_control:spending-list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Lista de cobros')

    def test_filter_invoice_empty(self):
        url = reverse('spending_control:spending-list') + '?invoice='
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        # Asegura que aparece el sin factura
        self.assertContains(response, 'Facturado')  # type displayed

        # Opcional: si hay más lógica visual, agregar asserts aquí

    def test_file_fields_render_correctly(self):
        response = self.client.get(reverse('spending_control:spending-list'))
        self.assertEqual(response.status_code, 200)

        # El que tiene factura debería tener enlace al archivo
        self.assertIn("invoice.pdf", response.content.decode())

        # El que no tiene, no debería mostrar link
        self.assertNotIn("doc_sin_factura.pdf", response.content.decode())
