from rest_framework import serializers

from apps.users.serializers import UserSerializer

from .models import Group, GroupMember


class GroupCreateSerializer(serializers.ModelSerializer):
    """POST /api/groups/  — יצירת קבוצה חדשה."""
    password = serializers.CharField(write_only=True, min_length=4, max_length=128)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'password', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('שם הקבוצה לא יכול להיות ריק.')
        return value

    def create(self, validated_data):
        raw_password = validated_data.pop('password')
        group = Group(owner=self.context['request'].user, **validated_data)
        group.set_password(raw_password)
        group.save()
        return group


class GroupSummarySerializer(serializers.ModelSerializer):
    """לשימוש ברשימות ה-Dashboard (My Teaching / My Student Groups) — כולל ספירות."""
    videos_count = serializers.IntegerField(read_only=True)
    members_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'videos_count', 'members_count', 'created_at']


class GroupDetailSerializer(serializers.ModelSerializer):
    """
    GET /api/groups/{id}/  — פרטי קבוצה.
    is_owner נחשב דינמית ביחס למי ששולח את הבקשה, כדי שה-Frontend ידע איזה UI להציג
    (אך זכרו: זו נוחות בלבד, לא מנגנון ההרשאה עצמו — זה תמיד נאכף מחדש בשרת).
    """
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    is_owner = serializers.SerializerMethodField()
    videos_count = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'description', 'owner_username',
            'is_owner', 'videos_count', 'members_count', 'created_at',
        ]

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return bool(request and obj.owner_id == request.user.id)

    def get_videos_count(self, obj):
        return obj.videos.count()

    def get_members_count(self, obj):
        return obj.members.count()


class GroupUpdateSerializer(serializers.ModelSerializer):
    """PATCH /api/groups/{id}/  — Owner בלבד."""

    class Meta:
        model = Group
        fields = ['name', 'description']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('שם הקבוצה לא יכול להיות ריק.')
        return value


class ChangeGroupPasswordSerializer(serializers.Serializer):
    """PATCH /api/groups/{id}/change-password/  — Owner בלבד."""
    new_password = serializers.CharField(min_length=4, max_length=128)


class JoinGroupSerializer(serializers.Serializer):
    """POST /api/groups/join/  — לפי סיסמת קבוצה בלבד."""
    password = serializers.CharField(write_only=True)


class GroupMemberSerializer(serializers.ModelSerializer):
    """GET /api/groups/{id}/members/  — Owner בלבד."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = GroupMember
        fields = ['id', 'user', 'joined_at']
