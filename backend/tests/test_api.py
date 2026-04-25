from pathlib import Path


async def test_healthcheck(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_scan_flow_generates_report_and_findings(client, site_server):
    response = await client.post("/api/v1/scans", json={"url": f"{site_server}/index.html"})
    assert response.status_code == 200
    payload = response.json()

    assert payload["status"] == "completed"
    assert payload["pages_scanned"] >= 2
    assert payload["total_violations"] >= 5
    assert payload["report_url"] == f"/api/v1/scans/{payload['id']}/report"
    assert payload["violations"][0]["severity"] in {"Critical", "High", "Medium", "Low"}
    assert isinstance(payload["violations"][0]["severity_score"], float)

    report_response = await client.get(payload["report_url"])
    assert report_response.status_code == 200
    assert report_response.headers["content-type"] == "application/pdf"


async def test_single_and_bulk_fix_flow(client, site_server):
    scan_response = await client.post("/api/v1/scans", json={"url": f"{site_server}/index.html"})
    scan_payload = scan_response.json()
    violation_id = scan_payload["violations"][0]["id"]

    fix_response = await client.post("/api/v1/fixes/single", json={"violation_id": violation_id})
    assert fix_response.status_code == 200
    fix_payload = fix_response.json()
    assert fix_payload["violation_id"] == violation_id
    assert fix_payload["fix"]["fixed_html"]
    assert fix_payload["fix"]["explanation"]

    bulk_response = await client.post("/api/v1/fixes/bulk", json={"scan_id": scan_payload["id"]})
    assert bulk_response.status_code == 200
    bulk_payload = bulk_response.json()
    assert bulk_payload["scan_id"] == scan_payload["id"]
    assert len(bulk_payload["fixes"]) == scan_payload["total_violations"]
