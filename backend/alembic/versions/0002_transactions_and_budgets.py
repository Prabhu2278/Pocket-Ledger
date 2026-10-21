"""transactions and budgets

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-20 00:01:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'expenses',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('note', sa.String(length=255), server_default='', nullable=False),
        sa.Column('spent_on', sa.Date(), nullable=False),
        sa.Column('payment_method', sa.String(length=30), server_default='UPI', nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.String(length=20), server_default='EXPENSE', nullable=False),
        sa.Column('wallet_id', sa.Integer(), sa.ForeignKey('wallets.id', ondelete='SET NULL'), nullable=True),
        sa.Column('to_wallet_id', sa.Integer(), sa.ForeignKey('wallets.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_expenses_category'), 'expenses', ['category'], unique=False)
    op.create_index(op.f('ix_expenses_spent_on'), 'expenses', ['spent_on'], unique=False)

    op.create_table(
        'budgets',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True),
        sa.Column('month_key', sa.String(length=10), nullable=False),
        sa.Column('target_amount', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_budgets_user_month'), 'budgets', ['user_id', 'month_key'], unique=True)

def downgrade() -> None:
    op.drop_table('budgets')
    op.drop_table('expenses')
