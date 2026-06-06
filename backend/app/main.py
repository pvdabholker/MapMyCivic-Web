from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base
from app.db import base  

from app.routes.authority_routes import router as authority_router
from app.routes.report_routes import router as report_router

from app.routes.notice_routes import router as notice_router


# 🚀 Create FastAPI app
app = FastAPI()


# 🔥 CORS MIDDLEWARE (CRITICAL FIX)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (dev)
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, PATCH, OPTIONS, etc.
    allow_headers=["*"],
)


# 🔧 DB INIT
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("✅ Database connected successfully")


# 🔗 ROUTES
app.include_router(authority_router, prefix="/authority", tags=["Authority"])
app.include_router(report_router, prefix="/report", tags=["Report"])
app.include_router(notice_router, prefix="/notice", tags=["Notice"])


# 🏠 ROOT
@app.get("/")
def home():
    return {"message": "MapMyCivic Backend Running 🚀"}