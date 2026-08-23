from django.contrib import admin

from .models import Group, GroupMember


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'created_at']
    search_fields = ['name', 'owner__username']
    readonly_fields = ['password_hash', 'created_at', 'updated_at']


@admin.register(GroupMember)
class GroupMemberAdmin(admin.ModelAdmin):
    list_display = ['group', 'user', 'joined_at']
