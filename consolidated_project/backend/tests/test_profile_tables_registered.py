"""Guard: the voice/relationship profile tables must register on Base.metadata
so init_db_schema_and_seed()'s create_all() builds them at startup.
"""
import app.db.models  # noqa: F401 — importing registers tables on Base.metadata
from app.db.base import Base


def test_profile_tables_are_registered():
    tables = set(Base.metadata.tables)
    assert "voice_profile" in tables
    assert "relationship_profile" in tables
    assert "emails" in tables  # existing table still present


def test_seed_module_imports_models_so_create_all_includes_them():
    # init_db_schema_and_seed lives in app.db.seed and imports app.db.models,
    # which is what registers the tables that create_all() then builds.
    import app.db.seed as seed
    assert hasattr(seed, "init_db_schema_and_seed")
