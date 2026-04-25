from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.requests import BulkFixRequest, ScanRequest, SingleFixRequest
from app.schemas.responses import (
    BulkFixResponse,
    HealthResponse,
    ScanResponse,
    SingleFixResponse,
)
from app.services.container import ServiceContainer

router = APIRouter(tags=["accessimed"])


def get_services(request: Request) -> ServiceContainer:
    return request.app.state.services


@router.get("/health", response_model=HealthResponse)
async def healthcheck() -> HealthResponse:
    return HealthResponse(status="ok")


@router.post("/scans", response_model=ScanResponse)
async def create_scan(
    payload: ScanRequest,
    services: ServiceContainer = Depends(get_services),
    session: AsyncSession = Depends(get_session),
) -> ScanResponse:
    return await services.scan_service.create_scan(session, payload)


@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str,
    services: ServiceContainer = Depends(get_services),
    session: AsyncSession = Depends(get_session),
) -> ScanResponse:
    scan = await services.scan_service.get_scan(session, scan_id)
    if scan is None:
        raise HTTPException(status_code=404, detail="Scan not found.")
    return scan


@router.get("/scans/{scan_id}/report")
async def download_report(
    scan_id: str,
    services: ServiceContainer = Depends(get_services),
    session: AsyncSession = Depends(get_session),
) -> FileResponse:
    report_path = await services.scan_service.get_report_path(session, scan_id)
    if report_path is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    return FileResponse(path=report_path, media_type="application/pdf", filename=f"{scan_id}.pdf")


@router.post("/fixes/single", response_model=SingleFixResponse)
async def create_single_fix(
    payload: SingleFixRequest,
    services: ServiceContainer = Depends(get_services),
    session: AsyncSession = Depends(get_session),
) -> SingleFixResponse:
    fix = await services.fix_service.create_single_fix(session, payload.violation_id)
    if fix is None:
        raise HTTPException(status_code=404, detail="Violation not found.")
    return fix


@router.post("/fixes/bulk", response_model=BulkFixResponse)
async def create_bulk_fix(
    payload: BulkFixRequest,
    services: ServiceContainer = Depends(get_services),
    session: AsyncSession = Depends(get_session),
) -> BulkFixResponse:
    return await services.fix_service.create_bulk_fixes(session, payload)
