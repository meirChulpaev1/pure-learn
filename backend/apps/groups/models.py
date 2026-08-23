import uuid

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class Group(models.Model):
    """
    קבוצת לימוד. ה-owner הוא ה'מורה' של הקבוצה הזו בלבד — אין שדה role גלובלי.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    password_hash = models.CharField(max_length=255)  # לעולם לא טקסט גלוי
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_groups',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def set_password(self, raw_password: str) -> None:
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password(raw_password, self.password_hash)

    def is_member(self, user) -> bool:
        return self.members.filter(user_id=user.id).exists()

    def is_owner(self, user) -> bool:
        return self.owner_id == user.id

    def __str__(self):
        return f'{self.name} (owner={self.owner_id})'


class GroupMember(models.Model):
    """טבלת קשר: משתמש שהצטרף לקבוצה כ'תלמיד'/חבר."""
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='group_memberships',
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['group', 'user'], name='unique_group_member')
        ]
        ordering = ['-joined_at']

    def __str__(self):
        return f'user={self.user_id} in group={self.group_id}'
