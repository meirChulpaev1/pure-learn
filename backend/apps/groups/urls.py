from django.urls import path

from .views import (
    ChangeGroupPasswordView,
    GroupCreateView,
    GroupDetailView,
    GroupMemberRemoveView,
    GroupMembersListView,
    JoinGroupView,
    MyStudentGroupsView,
    MyTeachingGroupsView,
)

urlpatterns = [
    path('my-teaching/', MyTeachingGroupsView.as_view(), name='groups-my-teaching'),
    path('my-student/', MyStudentGroupsView.as_view(), name='groups-my-student'),
    path('join/', JoinGroupView.as_view(), name='groups-join'),
    path('', GroupCreateView.as_view(), name='groups-create'),
    path('<uuid:id>/', GroupDetailView.as_view(), name='groups-detail'),
    path('<uuid:id>/change-password/', ChangeGroupPasswordView.as_view(), name='groups-change-password'),
    path('<uuid:id>/members/', GroupMembersListView.as_view(), name='groups-members'),
    path('<uuid:id>/members/<int:user_id>/', GroupMemberRemoveView.as_view(), name='groups-member-remove'),
]
