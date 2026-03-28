from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
import routers as routers

app = FastAPI(title="No-Due Clearance System API")

# Initialize DB on startup
@app.on_event("startup")
def on_startup():
    init_db()

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(routers.auth_router.router)
app.include_router(routers.student_router.router)
app.include_router(routers.faculty_router.router)
app.include_router(routers.department_router.router)
app.include_router(routers.hod_router.router)
app.include_router(routers.admin_router.router)
app.include_router(routers.common_router.router)
app.include_router(routers.notification_router.router)

@app.get("/")
async def root():
    return {"message": "Welcome to No-Due Clearance System API"}
