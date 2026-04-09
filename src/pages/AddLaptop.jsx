import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

const InputField = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-shadow"
    />
  </div>
)

const ToggleSwitch = ({ icon, label, name, checked, onChange }) => (
  <label className="flex items-center justify-between py-4 px-2 hover:bg-surface-container/50 transition-colors rounded-lg cursor-pointer group min-h-[48px]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
      </div>
      <span className="text-sm font-semibold text-[#1A1A1A]">{label}</span>
    </div>
    <div className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors ${checked ? 'bg-primary-container' : 'bg-surface-container-highest'}`}>
      <div className={`absolute w-4 h-4 bg-white rounded-full transition-all ${checked ? 'right-1' : 'left-1'}`}></div>
    </div>
    <input 
      type="checkbox" 
      name={name} 
      checked={checked} 
      onChange={onChange} 
      className="hidden" 
    />
  </label>
);

export default function AddLaptop() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    item_code: '',
    brand: '',
    model: '',
    processor: '',
    ram: '',
    storage_capacity: '',
    storage_type: 'SSD',
    actual_qty: 0,
    updated_on_website: false,
    paid_ads: false,
    photoshoot: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleQuantity = (amount) => {
    setFormData(prev => ({
      ...prev,
      actual_qty: Math.max(0, prev.actual_qty + amount)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const loadingToast = toast.loading('Saving laptop...')

    const submissionData = {
      ...formData,
      actual_qty: parseInt(formData.actual_qty) || 0
    }

    const { error } = await supabase
      .from('laptops')
      .insert([submissionData])

    if (error) {
      toast.error(error.message, { id: loadingToast })
      setLoading(false)
    } else {
      toast.success('Laptop added successfully!', { id: loadingToast })
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-surface p-6 font-['Inter']">
      <header className="flex items-center gap-4 mb-8 max-w-lg mx-auto pt-4 relative">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <h1 className="text-2xl font-black text-primary tracking-tight">Add Laptop</h1>
      </header>

      <main className="max-w-lg mx-auto pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-4">
            <h2 className="text-sm font-bold text-[#1A1A1A] mb-2 uppercase tracking-wide">Identity</h2>
            <InputField label="Item Code" name="item_code" value={formData.item_code} onChange={handleChange} placeholder="e.g. LPT-042" />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Dell" />
              <InputField label="Model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Latitude 7400" />
            </div>
          </div>

          <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-4">
            <h2 className="text-sm font-bold text-[#1A1A1A] mb-2 uppercase tracking-wide">Specifications</h2>
            <InputField label="Processor" name="processor" value={formData.processor} onChange={handleChange} placeholder="e.g. Intel Core i5-8365U" />
            <InputField label="RAM" name="ram" value={formData.ram} onChange={handleChange} placeholder="e.g. 16GB DDR4" />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Capacity" name="storage_capacity" value={formData.storage_capacity} onChange={handleChange} placeholder="e.g. 512GB" />
              <div>
                <label className="block text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-2">
                  Storage Type
                </label>
                <select 
                  name="storage_type" 
                  value={formData.storage_type} 
                  onChange={handleChange}
                  className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-shadow"
                >
                  <option value="SSD">SSD</option>
                  <option value="HDD">HDD</option>
                  <option value="NVME">NVME</option>
                  <option value="eMMC">eMMC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <label className="block text-xs font-bold text-on-surface-variant tracking-wider uppercase mb-4">
              Initial Stock Quantity
            </label>
            <div className="flex items-center justify-between bg-surface-container rounded-xl p-2">
              <button 
                type="button"
                onClick={() => handleQuantity(-1)}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-primary">remove</span>
              </button>
              
              <div className="flex-1 text-center">
                <span className="text-3xl font-black text-[#1A1A1A] tabular-nums">{formData.actual_qty}</span>
              </div>
              
              <button 
                type="button"
                onClick={() => handleQuantity(1)}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-primary">add</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <ToggleSwitch icon="language" label="Listed on Website" name="updated_on_website" checked={formData.updated_on_website} onChange={handleChange} />
            <ToggleSwitch icon="ads_click" label="Paid Ads Active" name="paid_ads" checked={formData.paid_ads} onChange={handleChange} />
            <ToggleSwitch icon="photo_camera" label="Photoshoot Done" name="photoshoot" checked={formData.photoshoot} onChange={handleChange} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-primary-container hover:bg-[#1b6d24] text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(30,111,40,0.2)] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center mt-8"
          >
            {loading ? 'Adding Record...' : 'Add Laptop'}
          </button>
        </form>
      </main>
    </div>
  )
}
