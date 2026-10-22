"""currency settings and categories

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-22 11:30:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column, select

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None

DEFAULT_EXPENSE_CATEGORIES = [
    {"name": "Food", "type": "expense", "icon": "utensils", "color": "#b42c45"},
    {"name": "Transport", "type": "expense", "icon": "car", "color": "#2563eb"},
    {"name": "Shopping", "type": "expense", "icon": "shopping-bag", "color": "#b45309"},
    {"name": "Bills", "type": "expense", "icon": "receipt", "color": "#0284c7"},
    {"name": "Home", "type": "expense", "icon": "home", "color": "#0d7a6f"},
    {"name": "Health", "type": "expense", "icon": "activity", "color": "#15803d"},
    {"name": "Education", "type": "expense", "icon": "graduation-cap", "color": "#6366f1"},
    {"name": "Entertainment", "type": "expense", "icon": "film", "color": "#9333ea"},
    {"name": "Fun", "type": "expense", "icon": "smile", "color": "#9333ea"},
    {"name": "Travel", "type": "expense", "icon": "compass", "color": "#0ea5e9"},
    {"name": "Other", "type": "expense", "icon": "more-horizontal", "color": "#64748b"},
]

DEFAULT_INCOME_CATEGORIES = [
    {"name": "Salary", "type": "income", "icon": "briefcase", "color": "#15803d"},
    {"name": "Freelance", "type": "income", "icon": "laptop", "color": "#2563eb"},
    {"name": "Business", "type": "income", "icon": "trending-up", "color": "#b45309"},
    {"name": "Investments", "type": "income", "icon": "pie-chart", "color": "#9333ea"},
    {"name": "Gifts", "type": "income", "icon": "gift", "color": "#ec4899"},
    {"name": "Other", "type": "income", "icon": "dollar-sign", "color": "#64748b"},
]

def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing_tables = insp.get_table_names()

    # 1. Create currency_settings table if it doesn't already exist
    if 'currency_settings' not in existing_tables:
        op.create_table(
            'currency_settings',
            sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('currency_code', sa.String(length=3), server_default='INR', nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )
        op.create_index(op.f('ix_currency_settings_user_id'), 'currency_settings', ['user_id'], unique=True)

    # 2. Create categories table if it doesn't already exist
    if 'categories' not in existing_tables:
        op.create_table(
            'categories',
            sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
            sa.Column('name', sa.String(length=50), nullable=False),
            sa.Column('type', sa.String(length=20), nullable=False),
            sa.Column('icon', sa.String(length=50), nullable=True),
            sa.Column('color', sa.String(length=20), nullable=True),
            sa.Column('is_default', sa.Boolean(), server_default=sa.text('false'), nullable=False),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )
        op.create_index(op.f('ix_categories_user_id'), 'categories', ['user_id'], unique=False)
        op.create_index(op.f('ix_categories_type'), 'categories', ['type'], unique=False)
        op.create_index('ix_categories_user_type', 'categories', ['user_id', 'type'], unique=False)
        op.create_index('ix_categories_type_active', 'categories', ['type', 'is_active'], unique=False)

    # 3. Data Migration: Seed currency preferences from settings / users into currency_settings
    users_t = table('users', column('id', sa.Integer), column('currency', sa.String))
    settings_t = table('settings', column('user_id', sa.Integer), column('currency', sa.String))
    currency_settings_t = table(
        'currency_settings',
        column('user_id', sa.Integer),
        column('currency_code', sa.String),
    )

    # Fetch users and existing settings
    users_rows = bind.execute(select(users_t.c.id, users_t.c.currency)).fetchall()
    
    existing_settings_map = {}
    if 'settings' in existing_tables:
        try:
            settings_rows = bind.execute(select(settings_t.c.user_id, settings_t.c.currency)).fetchall()
            for r in settings_rows:
                if r[0] is not None and r[1]:
                    existing_settings_map[r[0]] = str(r[1]).strip().upper()
        except Exception:
            pass

    existing_cs_rows = bind.execute(select(currency_settings_t.c.user_id)).fetchall()
    existing_cs_users = {r[0] for r in existing_cs_rows}

    for u in users_rows:
        user_id = u[0]
        if user_id not in existing_cs_users:
            code = existing_settings_map.get(user_id) or (str(u[1]).strip().upper() if u[1] else 'INR')
            if code not in ('INR', 'USD', 'EUR', 'GBP'):
                code = 'INR'
            bind.execute(
                currency_settings_t.insert().values(
                    user_id=user_id,
                    currency_code=code,
                )
            )
            existing_cs_users.add(user_id)

    # 4. Data Migration: Seed system default categories
    categories_t = table(
        'categories',
        column('user_id', sa.Integer),
        column('name', sa.String),
        column('type', sa.String),
        column('icon', sa.String),
        column('color', sa.String),
        column('is_default', sa.Boolean),
        column('is_active', sa.Boolean),
    )

    existing_defaults = bind.execute(
        select(categories_t.c.name, categories_t.c.type).where(categories_t.c.user_id == None)
    ).fetchall()
    existing_keys = {(r[0].lower(), r[1].lower()) for r in existing_defaults}

    all_defaults = DEFAULT_EXPENSE_CATEGORIES + DEFAULT_INCOME_CATEGORIES
    for d in all_defaults:
        key = (d["name"].lower(), d["type"].lower())
        if key not in existing_keys:
            bind.execute(
                categories_t.insert().values(
                    user_id=None,
                    name=d["name"],
                    type=d["type"],
                    icon=d["icon"],
                    color=d["color"],
                    is_default=True,
                    is_active=True,
                )
            )
            existing_keys.add(key)

def downgrade() -> None:
    op.drop_table('categories')
    op.drop_table('currency_settings')
