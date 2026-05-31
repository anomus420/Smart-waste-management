import { useState } from 'react'
import { ewasteService } from '../../services/ewasteService'
import { EWASTE_TYPES, TIME_SLOTS } from '../../utils/constants'
import Alert from '../common/Alert'

const EWasteForm = ({ onSuccess }) => {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const [form, setForm] = useState({ wasteType: '', quantity: '', description: '', address: '', pickupDate: '', pickupTimeSlot: 'morning', contactPhone: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const validate = () => {
    const errs = {}
    if (!form.wasteType) errs.wasteType = 'Waste type is required'
    if (!form.quantity.trim()) errs.quantity = 'Quantity is required'
    if (!form.address.trim()) errs.address = 'Pickup address is required'
    if (!form.pickupDate) errs.pickupDate = 'Pickup date is required'
    if (!form.contactPhone.trim()) errs.contactPhone = 'Contact phone is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      await ewasteService.createPickup(form)
      setAlert({ type: 'success', message: 'Pickup request submitted successfully!' })
      onSuccess?.()
      setForm({ wasteType: '', quantity: '', description: '', address: '', pickupDate: '', pickupTimeSlot: 'morning', contactPhone: '' })
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to submit request.' })
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '', required = true) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type={type} value={form[key]} min={type === 'date' ? minDate : undefined}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${errors[key] ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}
        placeholder={placeholder} />
      {errors[key] && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Waste Type <span className="text-red-500">*</span></label>
        <select value={form.wasteType} onChange={e => setForm({ ...form, wasteType: e.target.value })}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.wasteType ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30'}`}>
          <option value="">Select waste type</option>
          {EWASTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {errors.wasteType && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.wasteType}</p>}
      </div>

      {field('quantity', 'Quantity / Description', 'text', 'e.g. 2 old phones, 1 laptop')}
      {field('address', 'Pickup Address', 'text', 'Full address for pickup')}
      {field('pickupDate', 'Pickup Date', 'date')}
      {field('contactPhone', 'Contact Phone', 'tel', '+91 XXXXX XXXXX')}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred Time Slot <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-3 gap-3">
          {TIME_SLOTS.map(slot => (
            <label key={slot.value} className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${form.pickupTimeSlot === slot.value ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
              <input type="radio" name="timeSlot" value={slot.value} checked={form.pickupTimeSlot === slot.value}
                onChange={e => setForm({ ...form, pickupTimeSlot: e.target.value })} className="sr-only" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{slot.value.charAt(0).toUpperCase() + slot.value.slice(1)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{slot.label.split('(')[1]?.replace(')', '') || ''}</p>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Additional Notes <span className="text-slate-400 dark:text-slate-500">(optional)</span></label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 resize-none"
          placeholder="Any special instructions..." />
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm transition-colors shadow-sm">
        {loading ? 'Submitting...' : 'Request Pickup'}
      </button>
    </form>
  )
}

export default EWasteForm