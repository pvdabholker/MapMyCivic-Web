from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.settings import settings

# 🔌 Create DB engine (connects to PostgreSQL)
engine = create_engine(settings.DATABASE_URL)

# 🧾 Session (used to talk to DB)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 🧱 Base class (all models will extend this)
Base = declarative_base()

# 📦 Dependency for routes
def get_db():
    db = SessionLocal()  
    # Open DB session

    try:
        yield db  
        # Provide session to API

    finally:
        db.close()  
        # Close after request