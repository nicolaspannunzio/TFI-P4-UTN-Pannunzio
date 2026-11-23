from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    """Unit of Work base: abre sesión en __enter__ y hace commit/rollback + close en __exit__."""

    def __enter__(self):
        self.session: Session = session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type is not None:
                self.rollback()
            else:
                self.commit()
        finally:
            self.session.close()

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()