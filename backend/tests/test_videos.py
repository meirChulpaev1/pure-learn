from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.groups.models import Group, GroupMember
from apps.videos.models import Video

User = get_user_model()


class VideoPermissionTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='meir', email='meir@example.com', password='StrongPass123!')
        self.student = User.objects.create_user(username='dana', email='dana@example.com', password='StrongPass123!')
        self.stranger = User.objects.create_user(username='yossi', email='yossi@example.com', password='StrongPass123!')

        self.group = Group(owner=self.owner, name='Python Beginners', description='')
        self.group.set_password('PY123')
        self.group.save()

        GroupMember.objects.create(group=self.group, user=self.student)

        self.video_url = f'/api/groups/{self.group.id}/videos/'

    def test_owner_can_add_video(self):
        self.client.force_authenticate(self.owner)
        response = self.client.post(self.video_url, {
            'title': 'Python Variables',
            'description': 'מבוא למשתנים',
            'url': 'https://youtube.com/watch?v=abc123',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        video = Video.objects.get(title='Python Variables')
        self.assertEqual(video.uploader, self.owner)
        self.assertEqual(video.group, self.group)

    def test_member_cannot_add_video(self):
        """הדרישה המפורשת: תלמיד לא יכול להוסיף סרטונים."""
        self.client.force_authenticate(self.student)
        response = self.client.post(self.video_url, {
            'title': 'Hacked Video',
            'url': 'https://youtube.com/watch?v=hack',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Video.objects.filter(title='Hacked Video').exists())

    def test_stranger_cannot_view_videos(self):
        """משתמש שאינו Owner ואינו Member לא רואה בכלל את תוכן הקבוצה."""
        Video.objects.create(title='Python Variables', url='https://youtube.com/watch?v=abc123',
                              uploader=self.owner, group=self.group)
        self.client.force_authenticate(self.stranger)
        response = self.client.get(self.video_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_member_can_view_videos(self):
        Video.objects.create(title='Python Variables', url='https://youtube.com/watch?v=abc123',
                              uploader=self.owner, group=self.group)
        self.client.force_authenticate(self.student)
        response = self.client.get(self.video_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_member_cannot_delete_video(self):
        video = Video.objects.create(title='Python Variables', url='https://youtube.com/watch?v=abc123',
                                      uploader=self.owner, group=self.group)
        self.client.force_authenticate(self.student)
        response = self.client.delete(f'{self.video_url}{video.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Video.objects.filter(id=video.id).exists())

    def test_member_cannot_edit_video(self):
        video = Video.objects.create(title='Python Variables', url='https://youtube.com/watch?v=abc123',
                                      uploader=self.owner, group=self.group)
        self.client.force_authenticate(self.student)
        response = self.client.patch(f'{self.video_url}{video.id}/', {'title': 'Hacked'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        video.refresh_from_db()
        self.assertEqual(video.title, 'Python Variables')

    def test_owner_can_delete_video(self):
        video = Video.objects.create(title='Python Variables', url='https://youtube.com/watch?v=abc123',
                                      uploader=self.owner, group=self.group)
        self.client.force_authenticate(self.owner)
        response = self.client.delete(f'{self.video_url}{video.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Video.objects.filter(id=video.id).exists())
