# client_app/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Authentification
    path('login/', views.ClientLoginView.as_view(), name='client-login'),
    path('set-password/', views.ClientSetPasswordView.as_view(), name='client-set-password'),
    path('token/refresh/', views.RefreshTokenView.as_view(), name='token-refresh'),
    
    # Profil et compte
    path('profile/', views.ClientProfileView.as_view(), name='client-profile'),
    path('solde/', views.SoldeView.as_view(), name='client-solde'),
    
    # Transactions
    path('transactions/', views.TransactionHistoryView.as_view(), name='client-transactions'),
    path('transfert/', views.TransfertView.as_view(), name='client-transfert'),  # AJOUTÉ
]