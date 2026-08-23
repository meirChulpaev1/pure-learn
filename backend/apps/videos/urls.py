from django.urls import path

from .views import VideoDetailView, VideoListCreateView

urlpatterns = [
    path('', VideoListCreateView.as_view(), name='videos-list-create'),
    path('<int:id>/', VideoDetailView.as_view(), name='videos-detail'),
]
