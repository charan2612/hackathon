# Execution security

The included execution service is a hackathon development baseline. For a production deployment,
run each submission in a disposable, non-privileged container or a dedicated sandbox runtime with:
- network disabled
- read-only base filesystem
- CPU quota
- memory quota
- PID/process quota
- strict timeout
- no Docker socket exposure
- separate unprivileged worker
- output limits

Do not run arbitrary student code in the FastAPI process.
