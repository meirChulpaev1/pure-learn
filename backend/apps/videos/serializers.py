from rest_framework import serializers

from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    uploader_username = serializers.CharField(source='uploader.username', read_only=True)

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'url',
            'created_at', 'uploader_username', 'group',
        ]
        read_only_fields = ['id', 'created_at', 'uploader_username', 'group']

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError('כותרת הסרטון לא יכולה להיות ריקה.')
        return value
