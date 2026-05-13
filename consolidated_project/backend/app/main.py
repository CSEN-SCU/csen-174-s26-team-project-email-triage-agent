import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import settings
from app.db.seed import init_db_schema_and_seed
from app.db.session import dispose_async_engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logging.getLogger("triage").setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db_schema_and_seed()
    try:
        yield
    finally:
        await dispose_async_engine()


app = FastAPI(
    title="Sales Email Triage Agent",
    description="LangGraph + Claude triage for B2B sales inboxes — prospects, deals, and customers.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "email-triage-agent", "docs": "/docs"}
