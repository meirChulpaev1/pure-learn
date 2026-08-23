from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Group, GroupMember
from .permissions import IsGroupOwner, IsGroupOwnerOrMember
from .serializers import (
    ChangeGroupPasswordSerializer,
    GroupCreateSerializer,
    GroupDetailSerializer,
    GroupMemberSerializer,
    GroupSummarySerializer,
    GroupUpdateSerializer,
    JoinGroupSerializer,
)


class MyTeachingGroupsView(generics.ListAPIView):
    """GET /api/groups/my-teaching/  — קבוצות שהמשתמש הוא ה-Owner שלהן."""
    serializer_class = GroupSummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Group.objects.filter(owner=self.request.user)
            .annotate(
                videos_count=Count('videos', distinct=True),
                members_count=Count('members', distinct=True),
            )
        )


class MyStudentGroupsView(generics.ListAPIView):
    """GET /api/groups/my-student/  — קבוצות שהמשתמש הצטרף אליהן כחבר."""
    serializer_class = GroupSummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Group.objects.filter(members__user=self.request.user)
            .annotate(
                videos_count=Count('videos', distinct=True),
                members_count=Count('members', distinct=True),
            )
        )


class GroupCreateView(generics.CreateAPIView):
    """POST /api/groups/  — יצירת קבוצה חדשה. היוצר הופך אוטומטית ל-Owner."""
    serializer_class = GroupCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/groups/{id}/  — Owner או Member.
    PATCH  /api/groups/{id}/  — Owner בלבד.
    DELETE /api/groups/{id}/  — Owner בלבד.
    """
    queryset = Group.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'id'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated(), IsGroupOwnerOrMember()]
        return [permissions.IsAuthenticated(), IsGroupOwner()]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return GroupDetailSerializer
        return GroupUpdateSerializer

    def get_object(self):
        obj = get_object_or_404(Group, id=self.kwargs['id'])
        self.check_object_permissions(self.request, obj)
        return obj


class ChangeGroupPasswordView(APIView):
    """PATCH /api/groups/{id}/change-password/  — Owner בלבד."""
    permission_classes = [permissions.IsAuthenticated, IsGroupOwner]

    def patch(self, request, id):
        group = get_object_or_404(Group, id=id)
        self.check_object_permissions(request, group)

        serializer = ChangeGroupPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        group.set_password(serializer.validated_data['new_password'])
        group.save(update_fields=['password_hash', 'updated_at'])
        return Response({'detail': 'סיסמת הקבוצה עודכנה בהצלחה.'}, status=status.HTTP_200_OK)


class JoinGroupView(APIView):
    """
    POST /api/groups/join/  {password}
    השרת סורק קבוצות ומחפש התאמת סיסמה (hash), ולא מקבל group id מהלקוח —
    כי בפועל התלמיד מקבל מהמורה רק סיסמה.
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'join_group'

    def post(self, request):
        serializer = JoinGroupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_password = serializer.validated_data['password']

        matched_group = None
        for group in Group.objects.all():
            if group.check_password(raw_password):
                matched_group = group
                break

        if matched_group is None:
            return Response({'detail': 'סיסמה שגויה.'}, status=status.HTTP_400_BAD_REQUEST)

        if matched_group.owner_id == request.user.id:
            return Response(
                {'detail': 'אתה כבר ה-Owner של קבוצה זו.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _, created = GroupMember.objects.get_or_create(group=matched_group, user=request.user)
        if not created:
            return Response(
                {'detail': 'כבר הצטרפת לקבוצה זו בעבר.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            GroupDetailSerializer(matched_group, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )


class GroupMembersListView(generics.ListAPIView):
    """GET /api/groups/{id}/members/  — Owner בלבד."""
    serializer_class = GroupMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupOwner]

    def get_queryset(self):
        group = get_object_or_404(Group, id=self.kwargs['id'])
        self.check_object_permissions(self.request, group)
        return group.members.select_related('user')


class GroupMemberRemoveView(APIView):
    """DELETE /api/groups/{id}/members/{user_id}/  — Owner בלבד."""
    permission_classes = [permissions.IsAuthenticated, IsGroupOwner]

    def delete(self, request, id, user_id):
        group = get_object_or_404(Group, id=id)
        self.check_object_permissions(request, group)

        membership = get_object_or_404(GroupMember, group=group, user_id=user_id)
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
