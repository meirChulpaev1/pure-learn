from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/groups/', include('apps.groups.urls')),
    path('api/groups/<uuid:group_id>/videos/', include('apps.videos.urls')),
]
