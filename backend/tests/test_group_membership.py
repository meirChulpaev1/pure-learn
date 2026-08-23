from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.groups.models import Group, GroupMember

User = get_user_model()


class GroupMembershipTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='meir', email='meir@example.com', password='StrongPass123!')
        self.student = User.objects.create_user(username='dana', email='dana@example.com', password='StrongPass123!')

        self.group = Group(owner=self.owner, name='Python Beginners', description='')
        self.group.set_password('PY123')
        self.group.save()

    def test_join_group_with_correct_password_succeeds(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/groups/join/', {'password': 'PY123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(GroupMember.objects.filter(group=self.group, user=self.student).exists())

    def test_join_group_with_wrong_password_fails(self):
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/groups/join/', {'password': 'WRONG'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(GroupMember.objects.filter(group=self.group, user=self.student).exists())

    def test_cannot_join_same_group_twice(self):
        GroupMember.objects.create(group=self.group, user=self.student)
        self.client.force_authenticate(self.student)
        response = self.client.post('/api/groups/join/', {'password': 'PY123'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(GroupMember.objects.filter(group=self.group, user=self.student).count(), 1)

    def test_owner_cannot_join_own_group(self):
        self.client.force_authenticate(self.owner)
        response = self.client.post('/api/groups/join/', {'password': 'PY123'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_member_can_view_but_not_manage_members(self):
        GroupMember.objects.create(group=self.group, user=self.student)

        self.client.force_authenticate(self.student)
        response = self.client.get(f'/api/groups/{self.group.id}/members/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)  # רשימת חברים = Owner בלבד

    def test_owner_can_remove_member(self):
        GroupMember.objects.create(group=self.group, user=self.student)

        self.client.force_authenticate(self.owner)
        response = self.client.delete(f'/api/groups/{self.group.id}/members/{self.student.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(GroupMember.objects.filter(group=self.group, user=self.student).exists())

    def test_non_owner_cannot_remove_member(self):
        other_student = User.objects.create_user(username='yossi', email='yossi@example.com', password='StrongPass123!')
        GroupMember.objects.create(group=self.group, user=self.student)

        self.client.force_authenticate(other_student)
        response = self.client.delete(f'/api/groups/{self.group.id}/members/{self.student.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
