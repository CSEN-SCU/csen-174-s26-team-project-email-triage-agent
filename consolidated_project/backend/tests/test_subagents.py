from app.agent.subagents import build_agents


def test_build_agents_has_two_named_subagents():
    agents = build_agents()
    assert set(agents.keys()) == {"context-enrichment", "drafter"}


def test_enrichment_agent_has_tools_drafter_has_none():
    agents = build_agents()
    enrichment = agents["context-enrichment"]
    drafter = agents["drafter"]
    assert "mcp__triage__gmail_sender_history" in enrichment.tools
    assert drafter.tools == []
