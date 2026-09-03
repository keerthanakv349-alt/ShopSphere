"""
log_admin_action() — the one function every admin mutation calls to
record what happened.

WHY THIS DOESN'T CALL db.commit() ITSELF:
Every existing admin endpoint already ends with its own db.commit()
for the actual mutation (create the product, update the order, etc).
Committing separately here would mean an audit entry could succeed
while the mutation it's describing rolls back (or vice versa) —
db.add() without a commit just enqueues the row so it lands in the
SAME transaction as the mutation it's logging, atomically.
"""
from app.models.audit_log import AuditLog
from app.models.user import User
from sqlalchemy.orm import Session


def log_admin_action(
    db: Session,
    admin_user: User,
    action: str,
    entity_type: str,
    entity_id: str | None,
    description: str,
) -> None:
    db.add(
        AuditLog(
            admin_user_id=admin_user.id,
            admin_name=admin_user.full_name,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            description=description,
        )
    )
