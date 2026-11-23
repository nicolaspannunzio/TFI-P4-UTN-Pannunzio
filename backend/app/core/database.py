from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)


def get_session():
    with session_factory() as session:
        yield session