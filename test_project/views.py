from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.views.generic import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect


class IndexView(LoginRequiredMixin, View):
    @staticmethod
    def get(request):
        return redirect('spending_control:spending-list')


class SignInView(LoginView):
    template_name = 'login.html'
    success_url = reverse_lazy('spending_control:spending-list')


class SignOutView(LogoutView):
    next_page = reverse_lazy('login')  #  Redirige al login después de logout
