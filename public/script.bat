@echo off
setlocal enabledelayedexpansion

REM ─── 0) Point to your iperf3 executable ───────────────────────────────
set "IPERF_EXE=C:\iperf\iperf3.exe"
if not exist "%IPERF_EXE%" (
  echo ERROR: iperf3.exe not found at "%IPERF_EXE%"
  pause
  exit /b 1
)

REM ─── 1) Server & client IPs ───────────────────────────────────────────
set "SERVER=192.168.0.89"
set "CLIENT_IPS=192.168.0.2 192.168.0.3 192.168.0.4 192.168.0.5"

REM ─── 2) Prepare logs folder ───────────────────────────────────────────
set "LOGDIR=%~dp0logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"

REM ─── 3) Loop through each client, run test, tee to console+file ───────
for %%C in (%CLIENT_IPS%) do (
  for /f "delims=" %%T in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "STAMP=%%T"

  set "LOGFILE=%LOGDIR%\iperf3_client_%%C_!STAMP!.log"
  echo.
  echo [!STAMP!] Testing from client %%C → server %SERVER% …

  powershell -NoProfile -Command "& '%IPERF_EXE%' -c %SERVER% -B %%C -t 10 -P 4 2>&1 | Tee-Object -FilePath '!LOGFILE!'"

  echo [!STAMP!] Done with %%C. Log: !LOGFILE!
)

REM ─── 4) Keep window open until you Ctrl+C ─────────────────────────────
echo.
echo All tests done. Press Ctrl+C to exit.
:KEEP_ALIVE
timeout /t 1 >nul
goto KEEP_ALIVE