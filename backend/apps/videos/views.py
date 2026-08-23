from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from apps.groups.models import Group
from apps.groups.permissions import IsGroupOwner, IsGroupOwnerOrMember

from .models import Video
from .serializers import VideoSerializer


class VideoListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/groups/{group_id}/videos/   — Owner או Member.
    POST /api/groups/{group_id}/videos/   — Owner בלבד.
    """
    serializer_class = VideoSerializer

    def get_group(self):
        return get_object_or_404(Group, id=self.kwargs['group_id'])

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsGroupOwner()]
        return [permissions.IsAuthenticated(), IsGroupOwnerOrMember()]

    def get_queryset(self):
        group = self.get_group()
        self.check_object_permissions(self.request, group)
        return Video.objects.filter(group=group)

    def perform_create(self, serializer):
        group = self.get_group()
        self.check_object_permissions(self.request, group)
        serializer.save(uploader=self.request.user, group=group)


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/groups/{group_id}/videos/{id}/  — Owner או Member.
    PATCH  /api/groups/{group_id}/videos/{id}/  — Owner בלבד.
    DELETE /api/groups/{group_id}/videos/{id}/  — Owner בלבד.
    """
    serializer_class = VideoSerializer
    lookup_url_kwarg = 'id'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated(), IsGroupOwnerOrMember()]
        return [permissions.IsAuthenticated(), IsGroupOwner()]

    def get_queryset(self):
        return Video.objects.filter(group_id=self.kwargs['group_id'])

    def get_object(self):
        video = get_object_or_404(
            Video, id=self.kwargs['id'], group_id=self.kwargs['group_id']
        )
        self.check_object_permissions(self.request, video)
        return video
