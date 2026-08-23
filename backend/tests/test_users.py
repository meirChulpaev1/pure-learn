from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegisterLoginTests(APITestCase):
    def test_register_creates_user_with_hashed_password(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'meir',
            'email': 'meir@example.com',
            'password': 'StrongPass123!',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='meir')
        self.assertNotEqual(user.password, 'StrongPass123!')  # מוצפן, לא טקסט גלוי
        self.assertTrue(user.check_password('StrongPass123!'))

    def test_register_rejects_duplicate_username(self):
        User.objects.create_user(username='meir', email='a@example.com', password='StrongPass123!')
        response = self.client.post('/api/auth/register/', {
            'username': 'meir',
            'email': 'b@example.com',
            'password': 'StrongPass123!',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_jwt_tokens(self):
        User.objects.create_user(username='meir', email='meir@example.com', password='StrongPass123!')
        response = self.client.post('/api/auth/login/', {
            'username': 'meir',
            'password': 'StrongPass123!',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_me_endpoint_requires_authentication(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
