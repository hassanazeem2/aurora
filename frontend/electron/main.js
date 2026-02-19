const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

const isDev = !app.isPackaged
const PORT = 3000
const BACKEND_PORT = 8000

let nextProcess = null
let backendProcess = null
let mainWindow = null

const frontendDir = app.isPackaged ? app.getAppPath() : path.join(__dirname, '..')
const backendDir = app.isPackaged ? path.join(path.dirname(app.getPath('exe')), '..', '..', 'backend') : path.join(__dirname, '..', '..', 'backend')

function startNextServer() {
  return new Promise((resolve) => {
    // In dev, Next is started by npm script; only start when running built app
    const shouldStartNext = process.env.ELECTRON_RUN_NEXT === '1' || app.isPackaged
    if (!shouldStartNext) return resolve()
    const nextBin = path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next')
    nextProcess = spawn('node', [nextBin, 'start', '-p', String(PORT)], {
      cwd: frontendDir,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' },
    })
    nextProcess.stdout?.on('data', (d) => process.stdout.write(d))
    nextProcess.stderr?.on('data', (d) => process.stderr.write(d))
    nextProcess.on('error', () => resolve())
    setTimeout(resolve, 6000)
  })
}

function tryStartBackend() {
  return new Promise((resolve) => {
    const uvicorn = spawn('python3', ['-m', 'uvicorn', 'main:app', '--port', String(BACKEND_PORT)], {
      cwd: backendDir,
      stdio: 'ignore',
      shell: false,
    })
    backendProcess = uvicorn
    uvicorn.on('error', () => resolve())
    uvicorn.on('exit', () => resolve())
    setTimeout(resolve, 2000)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'AURORA – Red Team Simulation',
    backgroundColor: '#0B0F14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  })

  const url = `http://localhost:${PORT}`
  mainWindow.loadURL(url)
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(async () => {
  await startNextServer()
  await tryStartBackend()
  createWindow()
})

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill()
  if (backendProcess) backendProcess.kill()
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
