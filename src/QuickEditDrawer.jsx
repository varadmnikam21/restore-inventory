import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

export default function QuickEditDrawer({ laptop, isOpen, onClose, onSave }) {
  const [quantity, setQuantity] = useState(0)
  const [onWebsite, setOnWebsite] = useState(false)
  const [paidAds, setPaidAds] = useState(false)
  const [photoshoot, setPhotoshoot] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sync state when laptop changes or drawer opens
  useEffect(() => {
    if (laptop && isOpen) {
      setQuantity(laptop.actual_qty)
      setOnWebsite(laptop.updated_on_website)
      setPaidAds(laptop.paid_ads)
      setPhotoshoot(laptop.photoshoot)
    }
  }, [laptop, isOpen])

  if (!isOpen || !laptop) return null;

  const handleSave = async () => {
    setLoading(true)
    
    // 1. Update in Supabase
    const { error } = await supabase
      .from('laptops')
      .update({
        actual_qty: quantity,
        updated_on_website: onWebsite,
        paid_ads: paidAds,
        photoshoot: photoshoot,
        updated_at: new Date().toISOString()
      })
      .eq('id', laptop.id)

    if (error) {
      toast.error(`Error saving: ${error.message}`)
      setLoading(false)
      return;
    }

    // 2. Call Edge Function if qty == 0
    if (quantity === 0) {
      try {
        await supabase.functions.invoke('send-stock-alert', {
          body: { laptop: { ...laptop, actual_qty: 0 } }
        });
      } catch (err) {
        console.error("Failed to send stock alert: ", err);
      }
    }

    setLoading(false)
    toast.success('Inventory updated')
    onClose()
    onSave()
  }

  // Toggle helpers
  const ToggleSwitch = ({ icon, label, checked, onChange }) => (
    <button 
      onClick={onChange}
      className="w-full flex items-center justify-between py-4 px-2 hover:bg-surface-container transition-colors rounded-lg group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        </div>
        <span className="text-sm font-semibold text-[#1A1A1A]">{label}</span>
      </div>
      <div className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors ${checked ? 'bg-primary-container' : 'bg-surface-container-highest'}`}>
        <div className={`absolute w-4 h-4 bg-white rounded-full transition-all ${checked ? 'right-1' : 'left-1'}`}></div>
      </div>
    </button>
  );

  return (
    <>
      {/* Overlay Scrim */}
      <div 
        className="fixed inset-0 bg-on-background/40 backdrop-blur-[2px] z-40 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Quick Edit Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 transform translate-y-0 transition-transform duration-300">
        <div className="mx-auto max-w-lg bg-[#FAFAFA] rounded-t-xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] px-6 pt-3 pb-10 max-h-[90vh] overflow-y-auto">
          
          {/* Handle */}
          <div className="flex justify-center mb-6 cursor-pointer" onClick={onClose}>
            <div className="w-12 h-1.5 bg-surface-container-highest rounded-full"></div>
          </div>

          {/* Top Section: Identity */}
          <div className="mb-8">
            <div className="inline-block px-2 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded uppercase tracking-wider mb-2">
              {laptop.item_code}
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{laptop.brand} {laptop.model}</h2>
            <p className="text-on-surface-variant font-medium text-sm mt-1">
              {laptop.processor} • {laptop.ram} • {laptop.storage_type} {laptop.storage_capacity}
            </p>
          </div>

          {/* Quantity Section */}
          <div className="mb-10">
            <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase mb-4">Stock Quantity</label>
            <div className="flex items-center justify-between bg-surface-container-low rounded-2xl p-2">
              <button 
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                className="w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-primary text-3xl">remove</span>
              </button>
              
              <div className="flex-1 text-center">
                <span className="text-5xl font-black text-[#1A1A1A] tabular-nums">{quantity}</span>
              </div>
              
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-primary text-3xl">add</span>
              </button>
            </div>
          </div>

          {/* Toggle Rows */}
          <div className="space-y-2 mb-10">
            <ToggleSwitch 
              icon="language" 
              label="Listed on Website" 
              checked={onWebsite} 
              onChange={() => setOnWebsite(!onWebsite)} 
            />
            <ToggleSwitch 
              icon="ads_click" 
              label="Paid Ads Active" 
              checked={paidAds} 
              onChange={() => setPaidAds(!paidAds)} 
            />
            <ToggleSwitch 
              icon="photo_camera" 
              label="Photoshoot Done" 
              checked={photoshoot} 
              onChange={() => setPhotoshoot(!photoshoot)} 
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full h-14 bg-primary-container hover:bg-[#1b6d24] text-white font-bold rounded-xl shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 min-h-[48px] text-on-surface-variant font-semibold text-sm hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
