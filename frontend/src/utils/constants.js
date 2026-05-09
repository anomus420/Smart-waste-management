export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const REFRESH_INTERVAL = 30000

export const COMPLAINT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
]

export const COMPLAINT_CATEGORIES = [
  { value: 'garbage_overflow', label: 'Garbage Overflow' },
  { value: 'illegal_dumping', label: 'Illegal Dumping' },
  { value: 'littering', label: 'Littering' },
  { value: 'hazardous_waste', label: 'Hazardous Waste' },
  { value: 'drainage_blockage', label: 'Drainage Blockage' },
  { value: 'other', label: 'Other' },
]

export const EWASTE_TYPES = [
  { value: 'mobile_phones', label: 'Mobile Phones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'tablets', label: 'Tablets' },
  { value: 'televisions', label: 'Televisions' },
  { value: 'refrigerators', label: 'Refrigerators' },
  { value: 'washing_machines', label: 'Washing Machines' },
  { value: 'printers', label: 'Printers' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'cables_accessories', label: 'Cables & Accessories' },
  { value: 'other', label: 'Other' },
]

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (8AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 4PM)' },
  { value: 'evening', label: 'Evening (4PM - 8PM)' },
]