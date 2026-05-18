import {useMemo, useRef, useState} from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL
const REQUEST_TIMEOUT_MS = 12000

const trackProfiles = ['Default', 'HighDegradationTrack', 'LowDegradationTrack', 'HighAltitudeTrack']
const flagStatuses = ['GREEN', 'YELLOW', 'RED', 'BLUE']
const trackConditions = ['DRY', 'PARTIALLY_WET', 'WET']
const weatherTrends = ['STABLE', 'RAIN_INTENSIFYING', 'RAIN_WEAKENING', 'DRYING']
const tyreCompounds = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET']
const driverIssues = ['NONE', 'STEERING_VIBRATION', 'BRAKE_PROBLEM', 'LOSS_OF_POWER']
const safetyCarModes = [
  { value: 'NONE', label: 'None' },
  { value: 'SAFETY_CAR', label: 'Safety Car' },
  { value: 'VIRTUAL_SC', label: 'Virtual SC' },
  { value: 'SC_ENDED', label: 'SC ended' },
]

const nowIso = () => new Date().toISOString()

const defaultForm = {
  sessionStartTime: nowIso(),
  eventTimestamp: nowIso(),
  trackProfile: 'Default',
  currentLap: 5,
  totalLaps: 58,
  criticalPhase: false,
  speedKmh: 280,
  lateralGForce: 2.0,
  longitudinalGForce: 1.0,
  ersBatteryPercentage: 40,
  consumptionDeltaKgPerLap: 0.05,
  engineTemperatureCelsius: 100,
  inDirtyAir: false,
  attemptingOvertake: false,
  brakeTemperatureCelsius: 700,
  tyreCompound: 'MEDIUM',
  lapsOnSet: 5,
  tyreTemperatureCelsius: 85,
  tyrePressureBar: 21.4,
  asphaltTemperatureCelsius: 34,
  rainProbabilityPercentage: 0,
  trackCondition: 'DRY',
  weatherTrend: 'STABLE',
  flagStatus: 'GREEN',
  safetyCarActive: false,
  virtualSafetyCarActive: false,
  safetyCarRecentlyEnded: false,
  driverSlowedForYellowFlag: false,
  gapAheadSeconds: 2.0,
  gapBehindSeconds: 3.0,
  wouldExitAheadAfterPit: false,
  driverIssue: 'NONE',
  driverNote: 'Hammer Time.',
  asymmetricCorneringGForces: false,
}

function numberValue(value) {
  return Number(value)
}

function timestampValue(value) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? nowIso() : parsed.toISOString()
}

function buildUpdatePayload(form) {
  const baseLap = numberValue(form.currentLap)
  const lapTime = 82 + Math.max(0, numberValue(form.lapsOnSet) - 20) * 0.08
  const ts = timestampValue(form.eventTimestamp)

  return {
    timestamp: ts,

    raceState: {
      currentLap: baseLap,
      totalLaps: numberValue(form.totalLaps),
      criticalPhase: form.criticalPhase,
    },
    batteryStatus: {
      ersBatteryPercentage: numberValue(form.ersBatteryPercentage),
    },
    fuelStatus: {
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
      rainProbabilityPercentage: numberValue(form.rainProbabilityPercentage),
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
    },
    driverReport: {
      issue: form.driverIssue,
      note: form.driverNote,
    },
    suspensionStatus: {
      asymmetricCorneringGForces: form.asymmetricCorneringGForces,
    },
    telemetry: {
      speedKmh: numberValue(form.speedKmh),

      lateralGForce: numberValue(form.lateralGForce),
      longitudinalGForce: numberValue(form.longitudinalGForce),

      tyrePressureBar: numberValue(form.tyrePressureBar),

      engineTemperatureCelsius: numberValue(form.engineTemperatureCelsius),
      brakeTemperatureCelsius: numberValue(form.brakeTemperatureCelsius),
      tyreTemperatureCelsius: numberValue(form.tyreTemperatureCelsius),

      lapTimeSeconds: lapTime,
    }
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
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`)
    }
    throw error
  }).finally(() => window.clearTimeout(timeoutId))

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}))
    throw new Error(errorJson.message || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null
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
            step={type === 'datetime-local' ? 1 : step}
            value={value}
            onChange={(e) =>
                onChange(type === 'number'
                    ? Number(e.target.value)
                    : e.target.value)
            }
        />
      </label>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
      <label className="field">
        <span>{label}</span>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
              <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>
          ))}
        </select>
      </label>
  )
}

function RadioGroup({ label, value, onChange, options }) {
  return (
      <fieldset className="radio-group">
        <legend>{label}</legend>
        <div>
          {options.map((option) => (
              <label key={option.value} className="radio-option">
                <input
                    type="radio"
                    name={label}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <span>{option.label}</span>
              </label>
          ))}
        </div>
      </fieldset>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
  )
}

function Metric({ label, value, unit, tone }) {
  return (
      <div className={`metric ${tone || ''}`}>
        <span>{label}</span>
        <strong>{value}{unit && <small>{unit}</small>}</strong>
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
              ? driverRecs.map((item, i) => <RecommendationCard key={`${item.message}-${i}`} item={item} />)
              : <div className="empty-state">No driver instructions</div>}
        </div>
        <div className="rec-column">
          <div className="rec-column-header">
            <span className="rec-column-label">Engineer</span>
            <span className="rec-count">{engineerRecs.length}</span>
          </div>
          {engineerRecs.length
              ? engineerRecs.map((item, i) => <RecommendationCard key={`${item.message}-${i}`} item={item} />)
              : <div className="empty-state">No warnings</div>}
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

  const [simSteps, setSimSteps] = useState([])
  const [simIndex, setSimIndex] = useState(0)
  const fileInputRef = useRef(null)

  const remainingLaps = useMemo(() => Math.max(0, Number(form.totalLaps) - Number(form.currentLap)), [form])
  const criticalCount = response.recommendations.filter((item) => item.urgency === 'CRITICAL').length
  const safetyCarMode = form.safetyCarActive
      ? 'SAFETY_CAR'
      : form.virtualSafetyCarActive
          ? 'VIRTUAL_SC'
          : form.safetyCarRecentlyEnded
              ? 'SC_ENDED'
              : 'NONE'

  const patchForm = (patch) => setForm((current) => ({ ...current, ...patch }))
  const setField = (field) => (value) => patchForm({ [field]: value })
  const setSafetyCarMode = (value) => patchForm({
    safetyCarActive: value === 'SAFETY_CAR',
    virtualSafetyCarActive: value === 'VIRTUAL_SC',
    safetyCarRecentlyEnded: value === 'SC_ENDED',
  })

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
          body: JSON.stringify({ trackProfile: form.trackProfile, startTime: timestampValue(form.sessionStartTime) }),
        })
        setSession(result)
        setResponse({ recommendations: [], derivedFacts: [] })
      }, 'Starting session')

  const updateRace = (payload) =>
      runAction(async () => {
        const body = payload ?? buildUpdatePayload(form)
        const result = await apiRequest('/api/race/update', {
          method: 'POST',
          body: JSON.stringify(body),
        })
        setResponse(result || { recommendations: [], derivedFacts: [] })
      }, 'Sending telemetry')

  const clearSession = () =>
      runAction(async () => {
        await apiRequest('/api/race/clear', { method: 'DELETE' })
        setSession(null)
        setResponse({ recommendations: [], derivedFacts: [] })
        setSimSteps([])
        setSimIndex(0)
      }, 'Clearing session')

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result)
        setSimSteps(parsed)
        setSimIndex(0)
        if (parsed[0]?._form) {
          patchForm(parsed[0]._form)
        }
        setStatus("Send update to sync")
        setError('')
      } catch (err) {
        setError('JSON not valid: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const simNext = () => {
    if (simIndex >= simSteps.length - 1) return

    const nextIndex = simIndex + 1
    const step = simSteps[nextIndex]

    if (!step) return

    if (step._form) {
      patchForm(step._form)
    }

    setSimIndex(nextIndex)
    setStatus("Send update to sync")
  }

  const simPrev = () => {
    if (simIndex <= 0) return

    const prevIndex = simIndex - 1
    const step = simSteps[prevIndex]

    if (step?._form) {
      patchForm(step._form)
    }

    setSimIndex(prevIndex)
    setStatus("Send update to sync")
  }

  const clearSimulation = () => {
    setSimSteps([])
    setSimIndex(0)
  }

  const simReset = () => {
    setSimIndex(0)
    if (simSteps[0]?._form) patchForm(simSteps[0]._form)
    setStatus("Send update to sync")

  }

  function toLocalDatetimeInputValue(iso) {
    const d = new Date(iso)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 19)
  }

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
            <div className="error-banner">
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
                <Field
                    label="Session start"
                    value={toLocalDatetimeInputValue(form.sessionStartTime)}
                    onChange={(v) => setField('sessionStartTime')(new Date(v).toISOString())}
                    type="datetime-local"
                />
                <Field
                    label="Event time"
                    value={toLocalDatetimeInputValue(form.eventTimestamp)}
                    onChange={(v) => setField('eventTimestamp')(new Date(v).toISOString())}
                    type="datetime-local"
                />
              </div>
              <div className="split">
                <Field label="Current lap" value={form.currentLap} onChange={setField('currentLap')} min="0" step="1" />
                <Field label="Total laps" value={form.totalLaps} onChange={setField('totalLaps')} min="1" step="1" />
              </div>
              <Toggle label="Critical phase" checked={form.criticalPhase} onChange={setField('criticalPhase')} />
            </section>

            <section className="panel action-panel">
              <div className="panel-heading">
                <h2>Simulation</h2>
                {simSteps.length > 0 && <span>{simSteps.length} steps</span>}
              </div>
              <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
              />
              <button
                  type="button"
                  className="ghost-button wide"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
              >
                Upload JSON
              </button>
              <button
                  type="button"
                  className="ghost-button wide"
                  onClick={clearSimulation}
                  disabled={busy || simSteps.length === 0}
              >
                Remove Simulation
              </button>
              {simSteps.length > 0 && (
                  <>
                    <div className="sim-progress-bar" style={{ marginTop: 10 }}>
                      <div
                          className="sim-progress-fill"
                          style={{ width: `${simSteps.length > 1 ? (simIndex / (simSteps.length - 1)) * 100 : 100}%` }}
                      />
                    </div>
                    {simSteps[simIndex]?._label && (
                        <div className="sim-label">{simSteps[simIndex]._label}</div>
                    )}
                    <div className="sim-controls">
                      <button type="button" className="ghost-button" onClick={simReset} disabled={busy}>↩</button>
                      <button
                          type="button"
                          className="primary-button"
                          onClick={simPrev}
                          disabled={busy || simIndex === 0}
                      >
                        Previous
                      </button>
                      <span className="sim-step-count">{simIndex + 1} / {simSteps.length}</span>
                      <button
                          type="button"
                          className="primary-button"
                          onClick={simNext}
                          disabled={busy || simIndex >= simSteps.length-1}
                      >
                        Next
                      </button>
                    </div>
                  </>
              )}
            </section>

            <section className="panel action-panel">
              <button type="button" className="primary-button wide" onClick={() => updateRace(null)} disabled={busy}>
                {busyAction === 'Sending telemetry' ? 'Sending...' : 'Send Update'}
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
              <div className="panel-heading"><h2>Track</h2></div>
              <SelectField label="Flag" value={form.flagStatus} onChange={setField('flagStatus')} options={flagStatuses} />
              <SelectField label="Condition" value={form.trackCondition} onChange={setField('trackCondition')} options={trackConditions} />
              <SelectField label="Weather trend" value={form.weatherTrend} onChange={setField('weatherTrend')} options={weatherTrends} />
              <Field label="Rain %" value={form.rainProbabilityPercentage} onChange={setField('rainProbabilityPercentage')} min="0" max="100" />
              <RadioGroup label="SC status" value={safetyCarMode} onChange={setSafetyCarMode} options={safetyCarModes} />
              <div className="toggle-row stacked">
                <Toggle label="Slowed for yellow" checked={form.driverSlowedForYellowFlag} onChange={setField('driverSlowedForYellowFlag')} />
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading"><h2>Race Gaps</h2></div>
              <div className="split">
                <Field label="Gap ahead" value={form.gapAheadSeconds} onChange={setField('gapAheadSeconds')} />
                <Field label="Gap behind" value={form.gapBehindSeconds} onChange={setField('gapBehindSeconds')} />
              </div>
              <div className="toggle-row stacked">
                <Toggle label="Exit ahead after pit" checked={form.wouldExitAheadAfterPit} onChange={setField('wouldExitAheadAfterPit')} />
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading"><h2>Driver</h2></div>
              <SelectField label="Issue" value={form.driverIssue} onChange={setField('driverIssue')} options={driverIssues} />
              <label className="field">
                <span>Radio note</span>
                <textarea value={form.driverNote} onChange={(e) => setField('driverNote')(e.target.value)} />
              </label>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <h2>Derived Facts</h2>
                <span>{response.derivedFacts.length}</span>
              </div>
              <div className="fact-list">
                {response.derivedFacts.length
                    ? response.derivedFacts.map((fact) => <span key={fact}>{fact}</span>)
                    : <em>No derived facts</em>}
              </div>
            </section>
          </aside>
        </section>
      </main>
  )
}

export default App
