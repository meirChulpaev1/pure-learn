from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.groups.models import Group

User = get_user_model()


class GroupOwnershipTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='meir', email='meir@example.com', password='StrongPass123!')
        self.other = User.objects.create_user(username='dana', email='dana@example.com', password='StrongPass123!')

    def test_create_group_sets_owner_and_hashes_password(self):
        self.client.force_authenticate(self.owner)
        response = self.client.post('/api/groups/', {
            'name': 'Python Beginners',
            'description': 'לומדים פייתון',
            'password': 'PY123',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        group = Group.objects.get(name='Python Beginners')
        self.assertEqual(group.owner, self.owner)
        self.assertNotEqual(group.password_hash, 'PY123')  # מוצפן
        self.assertTrue(group.check_password('PY123'))

    def test_non_owner_cannot_edit_group(self):
        group = Group(owner=self.owner, name='Python Beginners', description='')
        group.set_password('PY123')
        group.save()

        self.client.force_authenticate(self.other)
        response = self.client.patch(f'/api/groups/{group.id}/', {'name': 'Hacked Name'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        group.refresh_from_db()
        self.assertEqual(group.name, 'Python Beginners')  # לא השתנה

    def test_owner_can_edit_group(self):
        group = Group(owner=self.owner, name='Python Beginners', description='')
        group.set_password('PY123')
        group.save()

        self.client.force_authenticate(self.owner)
        response = self.client.patch(f'/api/groups/{group.id}/', {'name': 'Python Advanced'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        group.refresh_from_db()
        self.assertEqual(group.name, 'Python Advanced')

    def test_non_owner_cannot_change_password(self):
        group = Group(owner=self.owner, name='Python Beginners', description='')
        group.set_password('PY123')
        group.save()

        self.client.force_authenticate(self.other)
        response = self.client.patch(
            f'/api/groups/{group.id}/change-password/', {'new_password': 'HACKED'}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_owner_cannot_delete_group(self):
        group = Group(owner=self.owner, name='Python Beginners', description='')
        group.set_password('PY123')
        group.save()

        self.client.force_authenticate(self.other)
        response = self.client.delete(f'/api/groups/{group.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Group.objects.filter(id=group.id).exists())

    def test_unrelated_user_cannot_view_group_detail(self):
        """משתמש שאינו Owner ואינו Member לא אמור לראות את פרטי הקבוצה."""
        group = Group(owner=self.owner, name='Python Beginners', description='')
        group.set_password('PY123')
        group.save()

        self.client.force_authenticate(self.other)
        response = self.client.get(f'/api/groups/{group.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
