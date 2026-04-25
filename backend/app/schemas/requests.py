from pydantic import AnyHttpUrl, BaseModel, Field


class ScanRequest(BaseModel):
    url: AnyHttpUrl
    max_pages: int | None = Field(default=None, ge=1, le=5)


class SingleFixRequest(BaseModel):
    violation_id: int = Field(ge=1)


class BulkFixRequest(BaseModel):
    scan_id: str = Field(min_length=1)
    pass
