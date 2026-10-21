"""initial users and wallets

Revision ID: 0001
Revises: 
Create Date: 2026-10-20 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    op.create_table(
        'wallets',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('name', sa.String(length=60), nullable=False),
        sa.Column('wallet_type', sa.String(length=30), server_default='BANK', nullable=False),
        sa.Column('initial_balance', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('color', sa.String(length=20), server_default='#10b981', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

def downgrade() -> None:
    op.drop_table('wallets')
    op.drop_table('users')
