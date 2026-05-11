"""add_performance_indexes

Revision ID: add_performance_indexes
Revises: e3d7a981449d
Create Date: 2026-04-18 15:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers
revision: str = 'add_performance_indexes'
down_revision: Union[str, Sequence[str], None] = 'e3d7a981449d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add performance indexes for frequently queried columns."""

    # Users table - for lookups by email and active status
    op.create_index('ix_users_email_verified', 'users', ['email', 'is_verified'])
    op.create_index('ix_users_role_active', 'users', ['role', 'is_active'])

    # Orders table - for filtering by user and status
    op.create_index('ix_orders_user_status', 'orders', ['user_id', 'order_status'])
    op.create_index('ix_orders_status_date', 'orders', ['order_status', 'created_at'])
    op.create_index('ix_orders_payment_status', 'orders', ['payment_status'])
    op.create_index('ix_orders_idempotency', 'orders', ['idempotency_key'])

    # Products table - for filtering by category and active status
    op.create_index('ix_products_category_active', 'products', ['category', 'is_active'])
    op.create_index('ix_products_brand', 'products', ['brand'])
    op.create_index('ix_products_price', 'products', ['price'])

    # Cart items - for user cart lookups
    op.create_index('ix_cart_items_user_product', 'cart_items', ['user_id', 'product_id'])

    # Refresh tokens - for fast token lookups
    op.create_index('ix_refresh_token_lookup', 'refresh_tokens', ['token', 'is_revoked', 'expires_at'])
    op.create_index('ix_refresh_tokens_user', 'refresh_tokens', ['user_id', 'is_revoked'])

    # Payment orders - for order lookups
    op.create_index('ix_payment_orders_lookup', 'payment_orders', ['razorpay_order_id', 'user_id'])
    op.create_index('ix_payment_orders_status', 'payment_orders', ['status'])

    # Order items - for order detail lookups
    op.create_index('ix_order_items_order', 'order_items', ['order_id'])
    op.create_index('ix_order_items_product', 'order_items', ['product_id'])

    # Email OTPs - for cleanup and verification
    op.create_index('ix_email_otps_expires', 'email_otps', ['expires_at'])

    # Product images - for product lookups
    op.create_index('ix_product_images_product', 'product_images', ['product_id', 'position'])
    op.create_index('ix_product_images_uuid', 'product_images', ['image_uuid'])

    # User profiles - for user lookups
    op.create_index('ix_user_profiles_user', 'user_profiles', ['user_id'])

    # Profile avatars - for gender filtering
    op.create_index('ix_profile_avatars_gender', 'profile_avatars', ['gender', 'is_active'])

    # Add database constraints for data integrity
    op.create_check_constraint(
        'check_products_price_positive',
        'products',
        'price >= 0'
    )
    op.create_check_constraint(
        'check_products_stock_non_negative',
        'products',
        'stock >= 0'
    )
    op.create_check_constraint(
        'check_cart_items_quantity_positive',
        'cart_items',
        'quantity > 0'
    )
    op.create_check_constraint(
        'check_order_items_quantity_positive',
        'order_items',
        'quantity > 0'
    )
    op.create_check_constraint(
        'check_orders_total_positive',
        'orders',
        'total_amount >= 0'
    )


def downgrade() -> None:
    """Remove performance indexes."""

    # Drop constraints first
    op.drop_constraint('check_products_price_positive', 'products', type_='check')
    op.drop_constraint('check_products_stock_non_negative', 'products', type_='check')
    op.drop_constraint('check_cart_items_quantity_positive', 'cart_items', type_='check')
    op.drop_constraint('check_order_items_quantity_positive', 'order_items', type_='check')
    op.drop_constraint('check_orders_total_positive', 'orders', type_='check')

    # Drop indexes
    op.drop_index('ix_users_email_verified', table_name='users')
    op.drop_index('ix_users_role_active', table_name='users')
    op.drop_index('ix_orders_user_status', table_name='orders')
    op.drop_index('ix_orders_status_date', table_name='orders')
    op.drop_index('ix_orders_payment_status', table_name='orders')
    op.drop_index('ix_orders_idempotency', table_name='orders')
    op.drop_index('ix_products_category_active', table_name='products')
    op.drop_index('ix_products_brand', table_name='products')
    op.drop_index('ix_products_price', table_name='products')
    op.drop_index('ix_cart_items_user_product', table_name='cart_items')
    op.drop_index('ix_refresh_token_lookup', table_name='refresh_tokens')
    op.drop_index('ix_refresh_tokens_user', table_name='refresh_tokens')
    op.drop_index('ix_payment_orders_lookup', table_name='payment_orders')
    op.drop_index('ix_payment_orders_status', table_name='payment_orders')
    op.drop_index('ix_order_items_order', table_name='order_items')
    op.drop_index('ix_order_items_product', table_name='order_items')
    op.drop_index('ix_email_otps_expires', table_name='email_otps')
    op.drop_index('ix_product_images_product', table_name='product_images')
    op.drop_index('ix_product_images_uuid', table_name='product_images')
    op.drop_index('ix_user_profiles_user', table_name='user_profiles')
    op.drop_index('ix_profile_avatars_gender', table_name='profile_avatars')
