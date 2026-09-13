use std::fs::{self, OpenOptions};
use std::io::Write;
use std::net::{SocketAddr, TcpStream};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::str::FromStr;
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

use tauri::path::BaseDirectory;
use tauri::{AppHandle, Emitter, Manager};

pub struct BackendProcess(pub Mutex<Option<Child>>);

const BACKEND_NAME: &str = "japanophile-mcp-backend.exe";
const BACKEND_PORT: u16 = 11193;

fn dev_backend_path() -> Option<PathBuf> {
    if !cfg!(debug_assertions) {
        return None;
    }
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("binaries")
        .join("japanophile-mcp-backend-x86_64-pc-windows-msvc.exe");
    path.exists().then_some(path)
}

fn log_line(app: &AppHandle, message: &str) {
    eprintln!("[backend] {message}");
    if let Ok(dir) = app.path().app_log_dir() {
        let _ = fs::create_dir_all(&dir);
        let log_path = dir.join("backend-spawn.log");
        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(log_path) {
            let _ = writeln!(file, "{message}");
        }
    }
}

fn resolve_bundled_backend(app: &AppHandle) -> Result<PathBuf, String> {
    let mut tried = Vec::new();

    if let Ok(path) = app.path().resolve(BACKEND_NAME, BaseDirectory::Resource) {
        tried.push(path.display().to_string());
        if path.exists() {
            return Ok(path);
        }
    }

    if let Ok(path) = app
        .path()
        .resolve(
            "resources/japanophile-mcp-backend.exe",
            BaseDirectory::Resource,
        )
    {
        tried.push(path.display().to_string());
        if path.exists() {
            return Ok(path);
        }
    }

    if let Ok(dir) = app.path().executable_dir() {
        let path = dir.join("resources").join(BACKEND_NAME);
        tried.push(path.display().to_string());
        if path.exists() {
            return Ok(path);
        }
    }

    Err(format!(
        "bundled backend missing from resources (tried: {})",
        tried.join("; ")
    ))
}

pub fn spawn_backend(app: AppHandle, state: &BackendProcess) -> Result<String, String> {
    if let Some(mut child) = state.0.lock().unwrap().take() {
        let _ = child.kill();
        let _ = child.wait();
    }
    free_port(BACKEND_PORT);

    let backend_path = if let Some(dev_path) = dev_backend_path() {
        log_line(&app, &format!("using dev backend: {}", dev_path.display()));
        dev_path
    } else {
        let bundled = resolve_bundled_backend(&app)?;
        log_line(
            &app,
            &format!("using bundled backend: {}", bundled.display()),
        );
        let s = bundled.to_string_lossy().to_string();
        s.strip_prefix("\\\\?\\")
            .map(PathBuf::from)
            .unwrap_or(bundled)
    };
    let workdir = app
        .path()
        .executable_dir()
        .unwrap_or_else(|_| {
            backend_path
                .parent()
                .map(PathBuf::from)
                .unwrap_or_else(|| PathBuf::from("."))
        });

    log_line(
        &app,
        &format!(
            "spawning {} (cwd {}) on port {BACKEND_PORT}",
            backend_path.display(),
            workdir.display()
        ),
    );

    let mut command = Command::new(&backend_path);
    command
        .current_dir(&workdir)
        .env("JPN_MCP_BACKEND_PORT", BACKEND_PORT.to_string())
        .env("JPN_MCP_HOST", "127.0.0.1")
        .env("JPN_MCP_TAURI", "1")
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    let child = command
        .spawn()
        .map_err(|e| format!("Failed to spawn {}: {e}", backend_path.display()))?;

    state.0.lock().unwrap().replace(child);

    let addr = SocketAddr::from_str(&format!("127.0.0.1:{BACKEND_PORT}")).unwrap();
    let app_health = app.clone();
    thread::spawn(move || {
        for attempt in 0..30 {
            thread::sleep(Duration::from_secs(2));
            match TcpStream::connect_timeout(&addr, Duration::from_secs(2)) {
                Ok(_) => {
                    log_line(
                        &app_health,
                        &format!(
                            "Backend health check PASSED on port {BACKEND_PORT} (attempt {})",
                            attempt + 1
                        ),
                    );
                    let _ = app_health.emit("backend-status", "ready");
                    return;
                }
                Err(e) => {
                    log_line(
                        &app_health,
                        &format!("Backend health check: {e} (attempt {})", attempt + 1),
                    );
                }
            }
        }
        log_line(
            &app_health,
            &format!(
                "Backend health check FAILED — not listening on port {BACKEND_PORT} after 30 attempts"
            ),
        );
        let _ = app_health.emit("backend-status", "error: backend not reachable");
    });

    Ok(format!("Backend starting on port {BACKEND_PORT}"))
}

fn free_port(port: u16) {
    #[cfg(windows)]
    {
        let script = format!(
            "Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | ForEach-Object {{ taskkill /F /PID $_.OwningProcess /T 2>$null }}"
        );
        let _ = Command::new("powershell.exe")
            .args(["-NoProfile", "-Command", &script])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status();

        for _attempt in 0..30 {
            let probe = format!(
                "if (Get-NetTCPConnection -LocalPort {port} -State Listen -ErrorAction SilentlyContinue) {{ '1' }} else {{ '0' }}"
            );
            let released = Command::new("powershell.exe")
                .args(["-NoProfile", "-Command", &probe])
                .output()
                .map(|o| {
                    let out = String::from_utf8_lossy(&o.stdout);
                    !out.trim().contains('1')
                })
                .unwrap_or(false);
            if released {
                break;
            }
            thread::sleep(Duration::from_millis(1000));
        }
        thread::sleep(Duration::from_millis(300));
    }
}
