# banking_client/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/client/', include('client_app.urls')),
]