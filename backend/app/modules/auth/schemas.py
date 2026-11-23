from sqlmodel import SQLModel


class LoginResponse(SQLModel):
    message: str