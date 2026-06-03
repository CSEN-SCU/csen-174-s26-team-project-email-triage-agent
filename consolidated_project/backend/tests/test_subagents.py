from app.agent.subagents import build_agents


def test_build_agents_has_two_named_subagents():
    agents = build_agents()
    assert set(agents.keys()) == {"context-enrichment", "drafter"}


def test_enrichment_and_drafter_have_expected_tools():
    agents = build_agents()
    enrichment = agents["context-enrichment"]
    drafter = agents["drafter"]
    assert "mcp__triage__gmail_sender_history" in enrichment.tools
    # Drafter now retrieves real past replies (tone) and prior facts (context).
    assert "mcp__triage__gmail_past_replies" in drafter.tools
    assert "mcp__triage__gmail_lookup_history" in drafter.tools
