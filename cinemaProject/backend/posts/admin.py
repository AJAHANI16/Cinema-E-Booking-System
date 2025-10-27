from django.contrib import admin
from .models import Movie, UserProfile, PaymentCard


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'rating', 'category', 'release_date', 'created_at']
    list_filter = ['category', 'rating', 'genre']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_verified', 'subscribed_to_promotions', 'created_at']
    list_filter = ['is_verified', 'subscribed_to_promotions']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['verification_token', 'reset_token', 'created_at', 'updated_at']


@admin.register(PaymentCard)
class PaymentCardAdmin(admin.ModelAdmin):
    list_display = ['user', 'card_holder_name', 'card_last_four', 'is_default', 'created_at']
    list_filter = ['is_default']
    search_fields = ['user__username', 'card_holder_name']
    readonly_fields = ['created_at', 'updated_at']
    
    def card_last_four(self, obj):
        return f"****{obj.card_number[-4:]}"
    card_last_four.short_description = 'Card Number'
