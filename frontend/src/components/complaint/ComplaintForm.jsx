import { useState } from 'react'
import { complaintService } from '../../services/complaintService'
import { COMPLAINT_CATEGORIES } from '../../utils/constants'
import Alert from '../common/Alert'
import LocationPickerModal from '../common/LocationPickerModal'

const ComplaintForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ title: '', description: '', locationAddress: '', locationLat: '', locationLng: '', category: '', isAnonymous: false })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [showMapModal, setShowMapModal] = useState(false)

  const handleLocationPicked = ({ address, lat, lng }) => {
    setForm(prev => ({
      ...prev,
      locationAddress: address,
      locationLat: lat,
      locationLng: lng,
    }))
    if (errors.locationAddress) {
      setErrors(prev => ({ ...prev, locationAddress: '' }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (form.title.length > 0 && form.title.length < 5) errs.title = 'Title must be at least 5 characters'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.locationAddress.trim()) errs.locationAddress = 'Location address is required'
    if (!form.category) errs.category = 'Category is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAutoFetch = () => {
    if (!navigator.geolocation) {
      setAlert({ type: 'error', message: 'Geolocation is not supported by your browser' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)
        setForm(prev => ({
          ...prev,
          locationLat: lat,
          locationLng: lng
        }))
        setAlert(null)

        // Attempt reverse geocoding to automatically populate the address too
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          if (data && data.display_name) {
            const addr = data.address || {}
            const mainParts = [
              addr.road || addr.pedestrian || addr.suburb,
              addr.neighbourhood || addr.residential || addr.suburb,
              addr.city || addr.town || addr.village || addr.county,
              addr.state,
            ].filter(Boolean)
            const clean = mainParts.length > 0 ? mainParts.join(', ') : data.display_name
            setForm(prev => ({
              ...prev,
              locationAddress: prev.locationAddress || clean
            }))
            try {
              localStorage.setItem('smartwaste_last_location', JSON.stringify({
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                address: clean
              }))
            } catch {}
          }
        } catch {
          // Address resolution silent fallback
        }
      },
      () => {
        setAlert({ type: 'error', message: 'Unable to retrieve your location' })
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (image) fd.append('image', image)
      const data = await complaintService.createComplaint(fd)
      setAiSuggestion(data.complaint?.aiSuggestion || null)
      setAlert({ type: 'success', message: 'Complaint filed successfully!' })
      onSuccess?.(data.complaint)
      setForm({ title: '', description: '', locationAddress: '', locationLat: '', locationLng: '', category: '', isAnonymous: false })
      setImage(null)
      setImagePreview(null)
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to submit complaint.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {aiSuggestion && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-xl p-4 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">AI Suggestion</p>
              <p className="text-green-700 dark:text-green-400 text-sm">Suggested Category: <strong className="text-green-900 dark:text-green-200">{aiSuggestion.category}</strong></p>
              {aiSuggestion.tips?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {aiSuggestion.tips.map((tip, i) => (
                    <li key={i} className="text-green-700 dark:text-green-400 text-xs flex items-start gap-1.5">
                      <span className="mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500 dark:text-red-400">*</span></label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${errors.title ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}
          placeholder="Brief title of the issue" />
        {errors.title && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description <span className="text-red-500 dark:text-red-400">*</span></label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${errors.description ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}
          placeholder="Describe the issue in detail..." />
        {errors.description && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500 dark:text-red-400">*</span></label>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${errors.category ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}>
          <option value="">Select a category</option>
          {COMPLAINT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {errors.category && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.category}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location Address <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-sm cursor-pointer"
          >
            <span>🗺️</span>
            <span>Select from Map</span>
          </button>
        </div>
        <input
          value={form.locationAddress}
          onChange={e => setForm({ ...form, locationAddress: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
            errors.locationAddress
              ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'
          }`}
          placeholder="Street address or landmark (or pick on map above)"
        />
        {errors.locationAddress && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.locationAddress}</p>}

        {/* Selected from Map Confirmation Badge */}
        {form.locationLat && form.locationLng && (
          <div className="mt-2 flex items-center justify-between bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-emerald-600 dark:text-emerald-400">📍</span>
              <span className="truncate font-medium">
                Pinned GPS: {parseFloat(form.locationLat).toFixed(4)}, {parseFloat(form.locationLng).toFixed(4)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 ml-2 cursor-pointer"
            >
              Adjust on Map
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Coordinates <span className="text-gray-400 dark:text-gray-500">(auto-filled by map)</span>
          </label>
          <button 
            type="button" 
            onClick={handleAutoFetch}
            className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>📍</span> Auto-fetch GPS
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input type="number" step="any" value={form.locationLat} onChange={e => setForm({ ...form, locationLat: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 font-mono text-xs"
              placeholder="Latitude" />
          </div>
          <div>
            <input type="number" step="any" value={form.locationLng} onChange={e => setForm({ ...form, locationLng: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 font-mono text-xs"
              placeholder="Longitude" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Photo <span className="text-gray-400 dark:text-gray-500">(optional)</span></label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
              <button type="button" onClick={() => { setImage(null); setImagePreview(null) }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
                ×
              </button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload a photo</p>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm({ ...form, isAnonymous: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-green-600 focus:ring-green-500 dark:focus:ring-green-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300">Submit anonymously</span>
      </label>

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer">
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>

      {/* Map Picker Modal */}
      <LocationPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirm={handleLocationPicked}
        initialLat={form.locationLat}
        initialLng={form.locationLng}
        initialAddress={form.locationAddress}
      />
    </form>
  )
}

export default ComplaintForm