import {useMemo, useState} from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL
const REQUEST_TIMEOUT_MS = 12000

const trackProfiles = ['Default', 'HighDegradationTrack', 'LowDegradationTrack', 'HighAltitudeTrack']
const flagStatuses = ['GREEN', 'YELLOW', 'RED', 'BLUE']
const trackConditions = ['DRY', 'PARTIALLY_WET', 'WET']
const weatherTrends = ['STABLE', 'RAIN_INTENSIFYING', 'RAIN_WEAKENING', 'DRYING']
const tyreCompounds = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET']
const driverIssues = ['NONE', 'STEERING_VIBRATION', 'BRAKE_PROBLEM', 'LOSS_OF_POWER']

const nowIso = () => new Date().toISOString()

const defaultForm = {
  trackProfile: 'Default',
  currentLap: 20,
  totalLaps: 58,
  criticalPhase: false,
  speedKmh: 284,
  lateralGForce: 3.1,
  longitudinalGForce: 1.2,
  fuelPressure: 95,
  oilPressure: 82,
  ersBatteryPercentage: 64,
  currentFuelKg: 35,
  plannedFuelKg: 36,
  consumptionDeltaKgPerLap: 0.18,
  engineTemperatureCelsius: 118,
  inDirtyAir: true,
  attemptingOvertake: true,
  brakeTemperatureCelsius: 930,
  tyreCompound: 'MEDIUM',
  lapsOnSet: 26,
  tyreTemperatureCelsius: 108,
  tyrePressureBar: 21.4,
  asphaltTemperatureCelsius: 34,
  humidityPercentage: 62,
  rainProbabilityPercentage: 70,
  rainIntensity: 0,
  trackCondition: 'DRY',
  weatherTrend: 'RAIN_INTENSIFYING',
  flagStatus: 'YELLOW',
  safetyCarActive: true,
  virtualSafetyCarActive: false,
  safetyCarRecentlyEnded: false,
  driverSlowedForYellowFlag: true,
  gapAheadSeconds: 0.8,
  gapBehindSeconds: 1.1,
  wouldExitAheadAfterPit: true,
  driverBehindVeryClose: false,
  beingLapped: false,
  driverIssue: 'STEERING_VIBRATION',
  driverNote: 'Vibration under braking at the end of the straight.',
  asymmetricCorneringGForces: true,
}

const scenarios = {
  attack: {
    flagStatus: 'GREEN',
    safetyCarActive: false,
    virtualSafetyCarActive: false,
    safetyCarRecentlyEnded: false,
    gapAheadSeconds: 0.7,
    ersBatteryPercentage: 72,
    attemptingOvertake: true,
    inDirtyAir: false,
    driverIssue: 'NONE',
    asymmetricCorneringGForces: false,
  },
  rain: {
    trackCondition: 'PARTIALLY_WET',
    weatherTrend: 'RAIN_INTENSIFYING',
    rainProbabilityPercentage: 88,
    rainIntensity: 0.6,
    flagStatus: 'GREEN',
    safetyCarActive: false,
    virtualSafetyCarActive: false,
  },
  safety: {
    flagStatus: 'YELLOW',
    safetyCarActive: true,
    virtualSafetyCarActive: false,
    driverSlowedForYellowFlag: true,
    lapsOnSet: 18,
    consumptionDeltaKgPerLap: 0.2,
  },
  failure: {
    engineTemperatureCelsius: 121,
    brakeTemperatureCelsius: 955,
    tyreTemperatureCelsius: 111,
    inDirtyAir: true,
    attemptingOvertake: true,
    driverIssue: 'STEERING_VIBRATION',
    asymmetricCorneringGForces: true,
  },
}

function numberValue(value) {
  return Number(value)
}

function eventTime(offsetSeconds = 0) {
  return new Date(Date.now() + offsetSeconds * 1000).toISOString()
}

function buildUpdatePayload(form) {
  const baseLap = numberValue(form.currentLap)
  const lapTime = 82 + Math.max(0, numberValue(form.lapsOnSet) - 20) * 0.08

  return {
    raceState: {
      currentLap: baseLap,
      totalLaps: numberValue(form.totalLaps),
      criticalPhase: form.criticalPhase,
    },
    batteryStatus: {
      ersBatteryPercentage: numberValue(form.ersBatteryPercentage),
    },
    fuelStatus: {
      currentFuelKg: numberValue(form.currentFuelKg),
      plannedFuelKg: numberValue(form.plannedFuelKg),
      consumptionDeltaKgPerLap: numberValue(form.consumptionDeltaKgPerLap),
    },
    engineStatus: {
      temperatureCelsius: numberValue(form.engineTemperatureCelsius),
      inDirtyAir: form.inDirtyAir,
      attemptingOvertake: form.attemptingOvertake,
    },
    brakeStatus: {
      averageTemperatureCelsius: numberValue(form.brakeTemperatureCelsius),
    },
    tyreStatus: {
      compound: form.tyreCompound,
      lapsOnSet: numberValue(form.lapsOnSet),
      averageTemperatureCelsius: numberValue(form.tyreTemperatureCelsius),
      averagePressureBar: numberValue(form.tyrePressureBar),
    },
    weatherStatus: {
      asphaltTemperatureCelsius: numberValue(form.asphaltTemperatureCelsius),
      humidityPercentage: numberValue(form.humidityPercentage),
      rainProbabilityPercentage: numberValue(form.rainProbabilityPercentage),
      rainIntensity: numberValue(form.rainIntensity),
      trackCondition: form.trackCondition,
      weatherTrend: form.weatherTrend,
    },
    trackStatus: {
      flagStatus: form.flagStatus,
      safetyCarActive: form.safetyCarActive,
      virtualSafetyCarActive: form.virtualSafetyCarActive,
      safetyCarRecentlyEnded: form.safetyCarRecentlyEnded,
      driverSlowedForYellowFlag: form.driverSlowedForYellowFlag,
    },
    competitorStatus: {
      gapAheadSeconds: numberValue(form.gapAheadSeconds),
      gapBehindSeconds: numberValue(form.gapBehindSeconds),
      wouldExitAheadAfterPit: form.wouldExitAheadAfterPit,
      driverBehindVeryClose: form.driverBehindVeryClose,
      beingLapped: form.beingLapped,
    },
    driverReport: {
      issue: form.driverIssue,
      note: form.driverNote,
    },
    suspensionStatus: {
      asymmetricCorneringGForces: form.asymmetricCorneringGForces,
    },
    lapTimeEvents: [
      { timestamp: eventTime(-130), lapNumber: Math.max(1, baseLap - 2), lapTimeSeconds: lapTime },
      { timestamp: eventTime(-65), lapNumber: Math.max(1, baseLap - 1), lapTimeSeconds: lapTime + 0.35 },
      { timestamp: eventTime(0), lapNumber: baseLap, lapTimeSeconds: lapTime + 0.85 },
    ],
    tyrePressureEvents: [
      { timestamp: eventTime(-20), pressureBar: numberValue(form.tyrePressureBar) + 0.18 },
      { timestamp: eventTime(-10), pressureBar: numberValue(form.tyrePressureBar) + 0.04 },
      { timestamp: eventTime(0), pressureBar: numberValue(form.tyrePressureBar) - 0.08 },
    ],
    temperatureEvents: [
      {
        timestamp: eventTime(-8),
        brakeTemperatureCelsius: numberValue(form.brakeTemperatureCelsius) - 8,
        engineTemperatureCelsius: numberValue(form.engineTemperatureCelsius) - 2,
        tyreTemperatureCelsius: numberValue(form.tyreTemperatureCelsius) - 2,
      },
      {
        timestamp: eventTime(-4),
        brakeTemperatureCelsius: numberValue(form.brakeTemperatureCelsius) - 3,
        engineTemperatureCelsius: numberValue(form.engineTemperatureCelsius),
        tyreTemperatureCelsius: numberValue(form.tyreTemperatureCelsius),
      },
      {
        timestamp: eventTime(0),
        brakeTemperatureCelsius: numberValue(form.brakeTemperatureCelsius),
        engineTemperatureCelsius: numberValue(form.engineTemperatureCelsius),
        tyreTemperatureCelsius: numberValue(form.tyreTemperatureCelsius),
      },
    ],
    gForceEvents: [],
    speedEvents: [],
    telemetryEvents: [],
  }
}

async function apiRequest(path, options = {}) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const headers = options.body
    ? { 'Content-Type': 'application/json', ...options.headers }
    : { ...options.headers }

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    signal: controller.signal,
    ...options,
  }).catch((error) => {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s: ${API_BASE}${path}`)
    }
    throw error
  }).finally(() => window.clearTimeout(timeoutId))

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;

    const errorJson = await response.json();
    errorMessage = errorJson.message || errorMessage;

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

function Field({ label, value, onChange, type = 'number', min, max, step = 'any' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(type === 'number' ? Number(event.target.value) : event.target.value)}
      />
    </label>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function Metric({ label, value, unit, tone }) {
  return (
    <div className={`metric ${tone || ''}`}>
      <span>{label}</span>
      <strong>
        {value}
        {unit && <small>{unit}</small>}
      </strong>
    </div>
  )
}

function RecommendationCard({ item }) {
  return (
      <article className={`recommendation ${item.urgency?.toLowerCase()}`}>
        <div>
          <span className="pill">{item.urgency}</span>
          <span className="type">{item.type?.replaceAll('_', ' ')}</span>
        </div>
        <p>{item.message}</p>
        <footer>
          <span>Engine {item.engineMode}</span>
          <span>ERS {item.ersMode}</span>
        </footer>
      </article>
  )
}

function RecommendationList({ recommendations }) {
  const driverRecs = recommendations.filter(r => r.type !== 'WARNING')
  const engineerRecs = recommendations.filter(r => r.type === 'WARNING')

  return (
      <div className="recommendations-split">
        <div className="rec-column">
          <div className="rec-column-header">
            <span className="rec-column-label">To Driver</span>
            <span className="rec-count">{driverRecs.length}</span>
          </div>
          {driverRecs.length
              ? driverRecs.map((item, i) => (
                  <RecommendationCard key={`${item.message}-${i}`} item={item} />
              ))
              : <div className="empty-state">No driver instructions</div>
          }
        </div>

        <div className="rec-column">
          <div className="rec-column-header">
            <span className="rec-column-label">Engineer</span>
            <span className="rec-count">{engineerRecs.length}</span>
          </div>
          {engineerRecs.length
              ? engineerRecs.map((item, i) => (
                  <RecommendationCard key={`${item.message}-${i}`} item={item} />
              ))
              : <div className="empty-state">No warnings</div>
          }
        </div>
      </div>
  )
}

function App() {
  const [form, setForm] = useState(defaultForm)
  const [session, setSession] = useState(null)
  const [response, setResponse] = useState({ recommendations: [], derivedFacts: [] })
  const [busy, setBusy] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState('')

  const remainingLaps = useMemo(() => Math.max(0, Number(form.totalLaps) - Number(form.currentLap)), [form])
  const criticalCount = response.recommendations.filter((item) => item.urgency === 'CRITICAL').length

  const patchForm = (patch) => setForm((current) => ({ ...current, ...patch }))
  const setField = (field) => (value) => patchForm({ [field]: value })

  const runAction = async (action, label) => {
    setBusy(true)
    setBusyAction(label)
    setError('')
    setStatus(label)
    try {
      const result = await action()
      setStatus('Synced')
      return result
    } catch (caught) {
      setError(caught.message)
      setStatus('Backend unavailable')
      return null
    } finally {
      setBusy(false)
      setBusyAction('')
    }
  }

  const startRace = () =>
    runAction(async () => {
      const result = await apiRequest('/api/race/start', {
        method: 'POST',
        body: JSON.stringify({ trackProfile: form.trackProfile, startTime: nowIso() }),
      })
      setSession(result)
      setResponse({ recommendations: [], derivedFacts: [] })
    }, 'Starting session')

  const updateRace = () =>
    runAction(async () => {
      const result = await apiRequest('/api/race/update', {
        method: 'POST',
        body: JSON.stringify(buildUpdatePayload(form)),
      })
      setResponse(result || { recommendations: [], derivedFacts: [] })
    }, 'Sending telemetry')

  const fireRules = () =>
    runAction(async () => {
      const result = await apiRequest('/api/race/fire', { method: 'POST' })
      setResponse(result || { recommendations: [], derivedFacts: [] })
    }, 'Evaluating rules')

  const clearSession = () =>
    runAction(async () => {
      await apiRequest('/api/race/clear', { method: 'DELETE' })
      setSession(null)
      setResponse({ recommendations: [], derivedFacts: [] })
    }, 'Clearing session')

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">F1 Virtual Race Engineer</span>
          <h1>Race Control</h1>
        </div>
        <div className="topbar-actions">
          <span className={`connection ${error ? 'offline' : 'online'}`}>{status}</span>
          <button type="button" className="ghost-button" onClick={clearSession} disabled={busy}>
            {busyAction === 'Clearing session' ? 'Clearing...' : 'Clear'}
          </button>
          <button type="button" className="primary-button" onClick={startRace} disabled={busy}>
            {busyAction === 'Starting session' ? 'Starting...' : 'Start'}
          </button>
        </div>
      </header>

      {error && (
          <div className="error-banner" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <span><strong>Error:</strong> {error}</span>
          </div>
      )}

      <section className="dashboard-grid">
        <aside className="left-panel">
          <section className="panel">
            <div className="panel-heading">
              <h2>Session</h2>
              <span>{session?.currentTime ? new Date(session.currentTime).toLocaleTimeString() : 'Not started'}</span>
            </div>
            <SelectField label="Track profile" value={form.trackProfile} onChange={setField('trackProfile')} options={trackProfiles} />
            <div className="split">
              <Field label="Current lap" value={form.currentLap} onChange={setField('currentLap')} min="0" step="1" />
              <Field label="Total laps" value={form.totalLaps} onChange={setField('totalLaps')} min="1" step="1" />
            </div>
            <Toggle label="Critical phase" checked={form.criticalPhase} onChange={setField('criticalPhase')} />
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Scenarios</h2>
            </div>
            <div className="scenario-grid">
              <button type="button" onClick={() => patchForm(scenarios.attack)}>Attack</button>
              <button type="button" onClick={() => patchForm(scenarios.rain)}>Rain</button>
              <button type="button" onClick={() => patchForm(scenarios.safety)}>SC</button>
              <button type="button" onClick={() => patchForm(scenarios.failure)}>Risk</button>
            </div>
          </section>

          <section className="panel action-panel">
            <button type="button" className="primary-button wide" onClick={updateRace} disabled={busy}>
              {busyAction === 'Sending telemetry' ? 'Sending...' : 'Send Update'}
            </button>
            <button type="button" className="ghost-button wide" onClick={fireRules} disabled={busy}>
              {busyAction === 'Evaluating rules' ? 'Evaluating...' : 'Fire Rules'}
            </button>
          </section>
        </aside>

        <section className="center-panel">
          <div className="status-strip">
            <Metric label="Remaining" value={remainingLaps} unit="laps" />
            <Metric label="ERS" value={form.ersBatteryPercentage} unit="%" tone={form.ersBatteryPercentage > 50 ? 'good' : ''} />
            <Metric label="Engine" value={form.engineTemperatureCelsius} unit="C" tone={form.engineTemperatureCelsius > 115 ? 'hot' : ''} />
            <Metric label="Critical" value={criticalCount} unit="alerts" tone={criticalCount ? 'hot' : 'good'} />
          </div>

          <section className="panel telemetry-panel">
            <div className="panel-heading">
              <h2>Car State</h2>
              <span>{form.flagStatus}</span>
            </div>
            <div className="form-grid">
              <Field label="Speed km/h" value={form.speedKmh} onChange={setField('speedKmh')} />
              <Field label="Lateral G" value={form.lateralGForce} onChange={setField('lateralGForce')} />
              <Field label="Longitudinal G" value={form.longitudinalGForce} onChange={setField('longitudinalGForce')} />
              <Field label="ERS battery %" value={form.ersBatteryPercentage} onChange={setField('ersBatteryPercentage')} min="0" max="100" step="1" />
              <Field label="Fuel delta kg/lap" value={form.consumptionDeltaKgPerLap} onChange={setField('consumptionDeltaKgPerLap')} />
              <Field label="Current fuel kg" value={form.currentFuelKg} onChange={setField('currentFuelKg')} />
              <Field label="Engine temp C" value={form.engineTemperatureCelsius} onChange={setField('engineTemperatureCelsius')} />
              <Field label="Brake temp C" value={form.brakeTemperatureCelsius} onChange={setField('brakeTemperatureCelsius')} />
              <Field label="Tyre temp C" value={form.tyreTemperatureCelsius} onChange={setField('tyreTemperatureCelsius')} />
              <Field label="Tyre pressure bar" value={form.tyrePressureBar} onChange={setField('tyrePressureBar')} />
              <Field label="Laps on tyres" value={form.lapsOnSet} onChange={setField('lapsOnSet')} step="1" />
              <SelectField label="Tyre compound" value={form.tyreCompound} onChange={setField('tyreCompound')} options={tyreCompounds} />
            </div>
            <div className="toggle-row">
              <Toggle label="Dirty air" checked={form.inDirtyAir} onChange={setField('inDirtyAir')} />
              <Toggle label="Attempting overtake" checked={form.attemptingOvertake} onChange={setField('attemptingOvertake')} />
              <Toggle label="Asymmetric G" checked={form.asymmetricCorneringGForces} onChange={setField('asymmetricCorneringGForces')} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Recommendations</h2>
              <span>
                {response.recommendations.length} total
                          {criticalCount > 0 && ` · ${criticalCount} critical`}
              </span>
            </div>
            <RecommendationList recommendations={response.recommendations} />
          </section>
        </section>

        <aside className="right-panel">
          <section className="panel">
            <div className="panel-heading">
              <h2>Track</h2>
            </div>
            <SelectField label="Flag" value={form.flagStatus} onChange={setField('flagStatus')} options={flagStatuses} />
            <SelectField label="Condition" value={form.trackCondition} onChange={setField('trackCondition')} options={trackConditions} />
            <SelectField label="Weather trend" value={form.weatherTrend} onChange={setField('weatherTrend')} options={weatherTrends} />
            <div className="split">
              <Field label="Rain %" value={form.rainProbabilityPercentage} onChange={setField('rainProbabilityPercentage')} min="0" max="100" />
              <Field label="Humidity %" value={form.humidityPercentage} onChange={setField('humidityPercentage')} min="0" max="100" />
            </div>
            <div className="toggle-row stacked">
              <Toggle label="Safety Car" checked={form.safetyCarActive} onChange={setField('safetyCarActive')} />
              <Toggle label="Virtual SC" checked={form.virtualSafetyCarActive} onChange={setField('virtualSafetyCarActive')} />
              <Toggle label="SC ended" checked={form.safetyCarRecentlyEnded} onChange={setField('safetyCarRecentlyEnded')} />
              <Toggle label="Slowed for yellow" checked={form.driverSlowedForYellowFlag} onChange={setField('driverSlowedForYellowFlag')} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Race Gaps</h2>
            </div>
            <div className="split">
              <Field label="Gap ahead" value={form.gapAheadSeconds} onChange={setField('gapAheadSeconds')} />
              <Field label="Gap behind" value={form.gapBehindSeconds} onChange={setField('gapBehindSeconds')} />
            </div>
            <div className="toggle-row stacked">
              <Toggle label="Exit ahead after pit" checked={form.wouldExitAheadAfterPit} onChange={setField('wouldExitAheadAfterPit')} />
              <Toggle label="Behind very close" checked={form.driverBehindVeryClose} onChange={setField('driverBehindVeryClose')} />
              <Toggle label="Being lapped" checked={form.beingLapped} onChange={setField('beingLapped')} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Driver</h2>
            </div>
            <SelectField label="Issue" value={form.driverIssue} onChange={setField('driverIssue')} options={driverIssues} />
            <label className="field">
              <span>Radio note</span>
              <textarea value={form.driverNote} onChange={(event) => setField('driverNote')(event.target.value)} />
            </label>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Derived Facts</h2>
              <span>{response.derivedFacts.length}</span>
            </div>
            <div className="fact-list">
              {response.derivedFacts.length ? response.derivedFacts.map((fact) => <span key={fact}>{fact}</span>) : <em>No derived facts</em>}
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}

export default App
