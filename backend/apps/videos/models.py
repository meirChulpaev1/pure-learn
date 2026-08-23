from django.conf import settings
from django.db import models


class Video(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    url = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_videos',
    )
    group = models.ForeignKey(
        'groups.Group',
        on_delete=models.CASCADE,
        related_name='videos',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
