import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import QuickEditDrawer from '../components/QuickEditDrawer'
import toast from 'react-hot-toast'

const SkeletonLoader = () => (
  <div className="w-full bg-surface-container-lowest rounded-2xl p-5 border shadow-sm border-outline-variant/30 flex flex-col gap-3">
    <div className="flex justify-between items-start w-full">
      <div className="flex gap-2">
        <div className="w-16 h-6 bg-surface-variant/50 rounded-md animate-pulse"></div>
        <div className="w-12 h-6 bg-surface-variant/50 rounded-md animate-pulse"></div>
      </div>
      <div className="w-20 h-6 bg-surface-variant/50 rounded-full animate-pulse"></div>
    </div>
    <div className="space-y-2 mt-2">
      <div className="w-48 h-6 bg-surface-variant/50 rounded-lg animate-pulse"></div>
      <div className="w-3/4 h-4 bg-surface-variant/50 rounded animate-pulse"></div>
    </div>
  </div>
)

export default function Dashboard() {
  const [laptops, setLaptops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  
  // Drawer states
  const [selectedLaptop, setSelectedLaptop] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false)

  const navigate = useNavigate()

  const fetchInventory = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('laptops')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      setError(error.message)
      toast.error('Failed to load inventory')
    } else {
      setLaptops(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleSyncToSheets = async () => {
    setIsSyncing(true)
    const loadingToast = toast.loading('Syncing to Google Sheets...')
    try {
      const { data, error } = await supabase.functions.invoke('sync-to-sheets')
      if (error) throw error
      toast.success('Successfully unified with Sheets!', { id: loadingToast })
    } catch (err) {
      toast.error(`Sync Failed: ${err.message}`, { id: loadingToast })
    } finally {
      setIsSyncing(false)
    }
  }

  // Filter Logic
  const filteredLaptops = laptops.filter((laptop) => {
    let filterMatch = true;
    if (activeFilter === 'Out of Stock') {
      filterMatch = laptop.actual_qty === 0;
    } else if (activeFilter !== 'All') {
      filterMatch = laptop.brand.toLowerCase() === activeFilter.toLowerCase();
    }

    const searchLower = searchQuery.toLowerCase();
    const searchMatch = 
      laptop.model?.toLowerCase().includes(searchLower) ||
      laptop.brand?.toLowerCase().includes(searchLower) ||
      laptop.processor?.toLowerCase().includes(searchLower);

    return filterMatch && searchMatch;
  });

  const filterOptions = ['All', 'Apple', 'Dell', 'Lenovo', 'HP', 'Out of Stock'];

  return (
    <div className="min-h-screen bg-surface p-6 font-['Inter'] relative">
      <header className="flex justify-between items-center mb-6 max-w-lg mx-auto pt-4 relative">
        <h1 className="text-2xl font-black text-primary tracking-tight">Restore Inventory</h1>
        
        <div className="flex items-center gap-3">
          {/* Sync Button */}
          <button 
            onClick={handleSyncToSheets}
            disabled={isSyncing}
            className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant transition-colors border border-outline-variant/30 shadow-sm"
            title="Sync to Sheets"
          >
            <span className={`material-symbols-outlined text-on-surface-variant ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
          </button>

          {/* User avatar right with logout dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-surface-variant transition-colors overflow-hidden"
            >
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 py-2 z-50">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 min-h-[48px] hover:bg-surface-container flex items-center gap-2 text-on-surface text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-24">
        {/* Search Bar */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search model, brand, or processor" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Filter Chips Container */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 scrollbar-hide -mx-2 px-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`flex-shrink-0 min-h-[48px] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeFilter === option 
                  ? (option === 'Out of Stock' ? 'bg-error text-on-error' : 'bg-primary text-on-primary')
                  : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:bg-surface-variant'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
             <div className="space-y-4">
               <SkeletonLoader />
               <SkeletonLoader />
               <SkeletonLoader />
               <SkeletonLoader />
             </div>
          ) : error ? (
            <div className="text-error font-medium text-center py-8">{error}</div>
          ) : filteredLaptops.length === 0 ? (
            <div className="text-on-surface-variant text-center py-12 flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
              <p>No inventory found.</p>
            </div>
          ) : (
            filteredLaptops.map((laptop) => {
              const isOutOfStock = laptop.actual_qty === 0;
              
              return (
                <button 
                  key={laptop.id}
                  onClick={() => {
                    setSelectedLaptop(laptop);
                    setIsDrawerOpen(true);
                  }}
                  className={`w-full text-left bg-surface-container-lowest rounded-2xl p-5 border shadow-sm transition-transform active:scale-[0.98] ${
                    isOutOfStock ? 'border-error border-l-4' : 'border-outline-variant/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <span className="px-2 py-0.5 bg-surface-container text-xs font-bold text-on-surface-variant rounded-md border border-outline-variant/20 uppercase tracking-wider">
                        {laptop.item_code}
                      </span>
                      <span className="px-2 py-0.5 bg-secondary-container text-xs font-bold text-on-secondary-container rounded-md uppercase tracking-wider">
                        {laptop.brand}
                      </span>
                      {/* Status dots */}
                      <div className="flex gap-1.5 ml-1">
                        {laptop.updated_on_website && <div className="w-2 h-2 rounded-full bg-[#19722b] shadow-sm" title="On Website"></div>}
                        {laptop.paid_ads && <div className="w-2 h-2 rounded-full bg-[#aa3bff] shadow-sm" title="Paid Ads"></div>}
                        {laptop.photoshoot && <div className="w-2 h-2 rounded-full bg-[#b14b6f] shadow-sm" title="Photoshoot"></div>}
                      </div>
                    </div>
                    {/* Quantity Pill */}
                    <div className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                      isOutOfStock ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'
                    }`}>
                      {laptop.actual_qty} IN STOCK
                    </div>
                  </div>
                  
                  <h3 className="text-[17px] font-black text-[#1A1A1A] leading-tight mb-1">
                    {laptop.model}
                  </h3>
                  
                  <div className="flex justify-between items-end">
                    {/* Specs Subline */}
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                      {laptop.processor && `${laptop.processor} • `} 
                      {laptop.ram && `${laptop.ram} • `} 
                      {laptop.storage_capacity} {laptop.storage_type}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={() => navigate('/add-laptop')}
          className="w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:bg-[#1b6d24] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>

      <QuickEditDrawer 
        isOpen={isDrawerOpen} 
        laptop={selectedLaptop} 
        onClose={() => setIsDrawerOpen(false)} 
        onSave={() => {
          fetchInventory() // Refresh the data seamlessly
        }}
      />
    </div>
  )
}
