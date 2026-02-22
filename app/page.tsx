'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  Search, Plus, Edit2, Trash2, Printer, Send, LayoutGrid, List, X, Tag, Package,
  MessageSquare, ChevronLeft, ChevronRight, Check, AlertCircle, ShoppingBag,
  Loader2, Sparkles, Hash, DollarSign, TrendingUp, BarChart3, CreditCard,
  Banknote, Smartphone, Calendar, ChevronDown, ChevronUp, Users, UserPlus, Mail, Phone
} from 'lucide-react'

// ============================================================
// CONSTANTS
// ============================================================
const AGENT_ID = '6998855dcbf2112bbf468a8c'

const CATEGORIES = ['All', 'Casual', 'Formal', 'Sportswear', 'Traditional', 'Western', 'Accessories']
const PRODUCT_CATEGORIES = ['Casual', 'Formal', 'Sportswear', 'Traditional', 'Western', 'Accessories']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const CLOTHING_COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Red', hex: '#c0392b' },
  { name: 'Burgundy', hex: '#722f37' },
  { name: 'Forest Green', hex: '#228b22' },
  { name: 'Olive', hex: '#6b8e23' },
  { name: 'Khaki', hex: '#c3b091' },
  { name: 'Cream', hex: '#fffdd0' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Brown', hex: '#8b4513' },
  { name: 'Beige', hex: '#f5f5dc' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Pink', hex: '#e8a0bf' },
  { name: 'Light Blue', hex: '#87ceeb' },
  { name: 'Teal', hex: '#008080' },
]
const ITEMS_PER_PAGE = 10

// ============================================================
// INTERFACES
// ============================================================
interface Product {
  id: string
  name: string
  sku: string
  price: number
  category: string
  sizes: string[]
  color: string
  description: string
  createdAt: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  category?: string
  timestamp: string
}

interface Sale {
  id: string
  productId: string
  productName: string
  sku: string
  category: string
  quantity: number
  unitPrice: number
  totalAmount: number
  customerName?: string
  paymentMethod: 'cash' | 'card' | 'upi'
  date: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalPurchases: number
  totalSpent: number
  lastVisit: string
  createdAt: string
}

// ============================================================
// SAMPLE DATA
// ============================================================
function generateSampleProducts(): Product[] {
  return [
    {
      id: 'p1', name: 'Heritage Cotton Oxford Shirt', sku: 'RT-482917',
      price: 59.99, category: 'Formal', sizes: ['S', 'M', 'L', 'XL'],
      color: 'White', description: 'Classic cotton oxford shirt with button-down collar, perfect for business casual settings.',
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      id: 'p2', name: 'Vintage Wash Denim Jeans', sku: 'RT-738261',
      price: 79.99, category: 'Casual', sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      color: 'Navy', description: 'Relaxed fit denim jeans with vintage wash finish. Durable construction with classic 5-pocket design.',
      createdAt: '2025-01-18T14:00:00Z'
    },
    {
      id: 'p3', name: 'Merino Wool Blazer', sku: 'RT-194573',
      price: 189.99, category: 'Formal', sizes: ['M', 'L', 'XL'],
      color: 'Grey', description: 'Tailored merino wool blazer with notch lapels and two-button closure. Fully lined interior.',
      createdAt: '2025-02-01T09:15:00Z'
    },
    {
      id: 'p4', name: 'Performance Running Tee', sku: 'RT-562839',
      price: 34.99, category: 'Sportswear', sizes: ['XS', 'S', 'M', 'L', 'XL'],
      color: 'Black', description: 'Moisture-wicking performance tee with mesh ventilation panels. Reflective logo detail.',
      createdAt: '2025-02-05T11:45:00Z'
    },
    {
      id: 'p5', name: 'Silk Embroidered Kurta', sku: 'RT-847291',
      price: 129.99, category: 'Traditional', sizes: ['S', 'M', 'L', 'XL'],
      color: 'Cream', description: 'Handcrafted silk kurta with delicate thread embroidery along the neckline and cuffs.',
      createdAt: '2025-02-10T16:20:00Z'
    },
    {
      id: 'p6', name: 'Leather Crossbody Bag', sku: 'RT-319846',
      price: 99.99, category: 'Accessories', sizes: ['M'],
      color: 'Brown', description: 'Full-grain leather crossbody bag with adjustable strap. Interior zip pocket and card slots.',
      createdAt: '2025-02-12T13:00:00Z'
    },
  ]
}

// ============================================================
// SAMPLE SALES DATA
// ============================================================
function generateSampleSales(products: Product[]): Sale[] {
  if (products.length === 0) return []
  const methods: ('cash' | 'card' | 'upi')[] = ['cash', 'card', 'upi']
  const customerNames = ['', 'Arjun Mehta', '', 'Priya Sharma', 'Ravi Kumar', '', 'Neha Patel', '', 'Vikram Singh', 'Anita Desai', '', 'Sanjay Gupta', '', 'Meera Joshi', 'Amit Reddy']
  const salesData: Sale[] = []
  const now = new Date()

  for (let i = 0; i < 15; i++) {
    const product = products[i % products.length]
    const qty = Math.floor(Math.random() * 4) + 1
    const daysAgo = Math.floor(Math.random() * 30)
    const saleDate = new Date(now)
    saleDate.setDate(saleDate.getDate() - daysAgo)
    saleDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60))

    salesData.push({
      id: `sale-${i}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      quantity: qty,
      unitPrice: product.price,
      totalAmount: qty * product.price,
      customerName: customerNames[i] || undefined,
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      date: saleDate.toISOString(),
    })
  }
  return salesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// ============================================================
// SAMPLE CUSTOMERS DATA
// ============================================================
function generateSampleCustomers(): Customer[] {
  return [
    { id: 'c1', name: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+91 98765 43210', totalPurchases: 5, totalSpent: 489.95, lastVisit: '2026-02-18T14:30:00Z', createdAt: '2025-11-10T10:00:00Z' },
    { id: 'c2', name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+91 87654 32109', totalPurchases: 3, totalSpent: 329.97, lastVisit: '2026-02-15T11:00:00Z', createdAt: '2025-12-05T09:00:00Z' },
    { id: 'c3', name: 'Ravi Kumar', email: 'ravi.k@email.com', phone: '+91 76543 21098', totalPurchases: 8, totalSpent: 1124.92, lastVisit: '2026-02-20T16:45:00Z', createdAt: '2025-10-01T08:30:00Z' },
    { id: 'c4', name: 'Neha Patel', email: 'neha.patel@email.com', phone: '+91 65432 10987', totalPurchases: 2, totalSpent: 169.98, lastVisit: '2026-02-10T13:15:00Z', createdAt: '2026-01-15T14:00:00Z' },
    { id: 'c5', name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 54321 09876', totalPurchases: 6, totalSpent: 754.94, lastVisit: '2026-02-19T10:30:00Z', createdAt: '2025-09-20T11:00:00Z' },
    { id: 'c6', name: 'Anita Desai', email: 'anita.desai@email.com', phone: '+91 43210 98765', totalPurchases: 4, totalSpent: 419.96, lastVisit: '2026-02-12T15:00:00Z', createdAt: '2025-12-20T10:00:00Z' },
    { id: 'c7', name: 'Sanjay Gupta', email: 'sanjay.g@email.com', phone: '+91 32109 87654', totalPurchases: 1, totalSpent: 189.99, lastVisit: '2026-02-08T12:00:00Z', createdAt: '2026-02-08T12:00:00Z' },
    { id: 'c8', name: 'Meera Joshi', email: 'meera.joshi@email.com', phone: '+91 21098 76543', totalPurchases: 7, totalSpent: 899.93, lastVisit: '2026-02-21T09:00:00Z', createdAt: '2025-08-15T08:00:00Z' },
  ]
}

// ============================================================
// BARCODE RENDERER (Code 39)
// ============================================================
const CODE39_CHARS: Record<string, string> = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnn', '6': 'nnwwwnnn', '7': 'nnnwnnwnw',
  '8': 'wnnwnnwn', '9': 'nnwwnnwn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
  'C': 'wnwnnwnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnn', 'F': 'nnwnwwnn',
  'G': 'nnnnnwwnw', 'H': 'wnnnnwwn', 'I': 'nnwnnwwn', 'J': 'nnnnwwwn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnw', 'N': 'nnnnwnnww',
  'O': 'wnnnwnnw', 'P': 'nnwnwnnw', 'Q': 'nnnnnnwww', 'R': 'wnnnnnww',
  'S': 'nnwnnnww', 'T': 'nnnnwnww', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn',
}

function renderBarcodeSVG(sku: string, width: number = 200, height: number = 60): React.ReactElement {
  const cleanSku = sku.toUpperCase().replace(/[^A-Z0-9\-. ]/g, '')
  const data = `*${cleanSku}*`
  const bars: { x: number; w: number }[] = []
  let pos = 0
  const narrowW = width / (data.length * 13 + (data.length - 1))
  const wideW = narrowW * 2.5

  for (let c = 0; c < data.length; c++) {
    const pattern = CODE39_CHARS[data[c]]
    if (!pattern) continue
    for (let i = 0; i < 9; i++) {
      const w = pattern[i] === 'w' ? wideW : narrowW
      if (i % 2 === 0) {
        bars.push({ x: pos, w })
      }
      pos += w
    }
    pos += narrowW
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      {bars.map((bar, i) => (
        <rect key={i} x={bar.x} y={0} width={Math.max(bar.w, 0.5)} height={height * 0.75} fill="hsl(30, 22%, 14%)" />
      ))}
      <text x={width / 2} y={height - 2} textAnchor="middle" fontSize={height * 0.17} fontFamily="monospace" fill="hsl(30, 22%, 14%)">
        {cleanSku}
      </text>
    </svg>
  )
}

// ============================================================
// MARKDOWN RENDERER
// ============================================================
function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ============================================================
// HELPER: generate SKU
// ============================================================
function generateSKU(): string {
  const num = Math.floor(100000 + Math.random() * 900000)
  return `RT-${num}`
}

function generateId(): string {
  return `p-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

// ============================================================
// ERROR BOUNDARY
// ============================================================
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ============================================================
// SUB-COMPONENTS (defined before Page)
// ============================================================

function SidebarNav({ activeSection, onNavigate }: { activeSection: string; onNavigate: (s: string) => void }) {
  const navItems = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: Plus },
    { id: 'print-tags', label: 'Print Tags', icon: Printer },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'assistant', label: 'Store Assistant', icon: MessageSquare },
  ]
  return (
    <aside className="w-64 bg-card border-r border-border/30 flex flex-col print:hidden shrink-0">
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-wide text-foreground">RetailTag</h1>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">Store Manager</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-foreground/70 hover:bg-secondary hover:text-foreground'}`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border/30">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-foreground">Store Assistant Agent</span>
          </div>
          <p className="text-xs text-muted-foreground ml-4">AI-powered retail helper</p>
        </div>
      </div>
    </aside>
  )
}

function ColorSwatch({ color, selected, onSelect }: { color: { name: string; hex: string }; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={color.name}
      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${selected ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-border/50 hover:scale-105'}`}
      style={{ backgroundColor: color.hex }}
    >
      {selected && <Check className={`w-4 h-4 ${color.hex === '#ffffff' || color.hex === '#fffdd0' || color.hex === '#f5f5dc' ? 'text-foreground' : 'text-white'}`} />}
    </button>
  )
}

function SizePill({ size, selected, onToggle }: { size: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border/50 hover:border-primary/50'}`}
    >
      {size}
    </button>
  )
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function Page() {
  // --- State ---
  const [activeSection, setActiveSection] = useState('inventory')
  const [products, setProducts] = useState<Product[]>([])
  const [sampleDataOn, setSampleDataOn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sizeFilter, setSizeFilter] = useState<string | null>(null)
  const [colorFilter, setColorFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  // Add/Edit product modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', category: '', sizes: [] as string[],
    color: '', description: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [aiDescLoading, setAiDescLoading] = useState(false)
  const [aiPriceLoading, setAiPriceLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Print tags
  const [printLayout, setPrintLayout] = useState<'2' | '4'>('4')

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Sales
  const [sales, setSales] = useState<Sale[]>([])
  const [salesModalOpen, setSalesModalOpen] = useState(false)
  const [salesSearchQuery, setSalesSearchQuery] = useState('')
  const [salesPage, setSalesPage] = useState(1)
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false)
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [aiInsightsSuggestions, setAiInsightsSuggestions] = useState<string[]>([])
  const [insightsExpanded, setInsightsExpanded] = useState(true)
  const [saleForm, setSaleForm] = useState({
    productId: '',
    quantity: '1',
    customerName: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi',
    date: ''
  })
  const [saleFormErrors, setSaleFormErrors] = useState<Record<string, string>>({})
  const [saleSaveSuccess, setSaleSaveSuccess] = useState(false)
  const [deleteSaleConfirmId, setDeleteSaleConfirmId] = useState<string | null>(null)

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [customerPage, setCustomerPage] = useState(1)
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '' })
  const [customerFormErrors, setCustomerFormErrors] = useState<Record<string, string>>({})
  const [customerSaveSuccess, setCustomerSaveSuccess] = useState(false)
  const [deleteCustomerConfirmId, setDeleteCustomerConfirmId] = useState<string | null>(null)

  // Timestamps (avoid hydration mismatch by initializing in useEffect)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Init sample data
  useEffect(() => {
    if (sampleDataOn) {
      const sampleProducts = generateSampleProducts()
      setProducts(sampleProducts)
      setSales(generateSampleSales(sampleProducts))
      setCustomers(generateSampleCustomers())
    } else {
      setProducts([])
      setSales([])
      setCustomers([])
      setSelectedProducts(new Set())
      setAiInsights(null)
      setAiInsightsSuggestions([])
    }
    setCurrentPage(1)
    setSalesPage(1)
    setCustomerPage(1)
  }, [sampleDataOn])

  // Init sale form date on mount
  useEffect(() => {
    setSaleForm(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }))
  }, [])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Reset save success after delay
  useEffect(() => {
    if (saveSuccess) {
      const t = setTimeout(() => setSaveSuccess(false), 2500)
      return () => clearTimeout(t)
    }
  }, [saveSuccess])

  // Reset sale save success
  useEffect(() => {
    if (saleSaveSuccess) {
      const t = setTimeout(() => setSaleSaveSuccess(false), 2500)
      return () => clearTimeout(t)
    }
  }, [saleSaveSuccess])

  // Reset customer save success
  useEffect(() => {
    if (customerSaveSuccess) {
      const t = setTimeout(() => setCustomerSaveSuccess(false), 2500)
      return () => clearTimeout(t)
    }
  }, [customerSaveSuccess])

  // --- Filtered products ---
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false
    if (sizeFilter && !p.sizes.includes(sizeFilter)) return false
    if (colorFilter && p.color !== colorFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedProducts = filteredProducts.slice((safeCurrentPage - 1) * ITEMS_PER_PAGE, safeCurrentPage * ITEMS_PER_PAGE)

  // Products selected for printing
  const printProducts = selectedProducts.size > 0
    ? products.filter((p) => selectedProducts.has(p.id))
    : filteredProducts

  // --- Modal helpers ---
  const openAddModal = useCallback(() => {
    setEditingProduct(null)
    setFormData({ name: '', sku: generateSKU(), price: '', category: '', sizes: [], color: '', description: '' })
    setFormErrors({})
    setSaveSuccess(false)
    setModalOpen(true)
  }, [])

  const openEditModal = useCallback((product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name, sku: product.sku, price: String(product.price),
      category: product.category, sizes: [...product.sizes],
      color: product.color, description: product.description
    })
    setFormErrors({})
    setSaveSuccess(false)
    setModalOpen(true)
  }, [])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Product name is required'
    if (!formData.sku.trim()) errors.sku = 'SKU is required'
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required'
    if (!formData.category) errors.category = 'Category is required'
    if (formData.sizes.length === 0) errors.sizes = 'At least one size is required'
    if (!formData.color) errors.color = 'Color is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProduct = useCallback(() => {
    if (!validateForm()) return
    const productData: Product = {
      id: editingProduct?.id || generateId(),
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      price: Number(formData.price),
      category: formData.category,
      sizes: formData.sizes,
      color: formData.color,
      description: formData.description.trim(),
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    }
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => p.id === editingProduct.id ? productData : p))
    } else {
      setProducts((prev) => [...prev, productData])
    }
    setSaveSuccess(true)
    setTimeout(() => setModalOpen(false), 1200)
  }, [formData, editingProduct])

  const handleDeleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setDeleteConfirmId(null)
  }, [])

  const toggleProductSelection = useCallback((id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)))
    }
  }, [paginatedProducts, selectedProducts])

  // --- AI Agent calls ---
  const handleAISuggestDescription = async () => {
    if (!formData.name && !formData.category) return
    setAiDescLoading(true)
    setActiveAgentId(AGENT_ID)
    try {
      const msg = `Suggest a product description for a ${formData.category || 'clothing'} item named "${formData.name || 'product'}". Color: ${formData.color || 'not specified'}. Sizes: ${formData.sizes.join(', ') || 'not specified'}. Keep it concise, 2-3 sentences, professional retail tone.`
      const result = await callAIAgent(msg, AGENT_ID)
      const agentResponse = result?.response?.result?.response ?? result?.response?.message ?? ''
      if (agentResponse) {
        setFormData((prev) => ({ ...prev, description: agentResponse }))
      }
    } catch (e) {
      console.error('AI description error:', e)
    } finally {
      setAiDescLoading(false)
      setActiveAgentId(null)
    }
  }

  const handleAISuggestPrice = async () => {
    if (!formData.name && !formData.category) return
    setAiPriceLoading(true)
    setActiveAgentId(AGENT_ID)
    try {
      const msg = `Suggest a retail price in USD for a ${formData.category || 'clothing'} item named "${formData.name || 'product'}". Color: ${formData.color || 'standard'}. Just give me a number (the price). No explanation needed, just the numeric price.`
      const result = await callAIAgent(msg, AGENT_ID)
      const agentResponse = result?.response?.result?.response ?? result?.response?.message ?? ''
      const priceMatch = agentResponse.match(/[\d]+\.?\d{0,2}/)
      if (priceMatch) {
        setFormData((prev) => ({ ...prev, price: priceMatch[0] }))
      }
    } catch (e) {
      console.error('AI price error:', e)
    } finally {
      setAiPriceLoading(false)
      setActiveAgentId(null)
    }
  }

  const handleSendChat = async (message?: string) => {
    const msg = message || chatInput.trim()
    if (!msg) return
    setChatInput('')
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, userMsg])
    setChatLoading(true)
    setActiveAgentId(AGENT_ID)
    try {
      const result = await callAIAgent(msg, AGENT_ID)
      const agentResponse = result?.response?.result?.response ?? result?.response?.message ?? 'I could not process that request.'
      const suggestions = Array.isArray(result?.response?.result?.suggestions) ? result.response.result.suggestions : []
      const category = result?.response?.result?.category ?? 'general'
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: agentResponse,
        suggestions,
        category,
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, assistantMsg])
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, errorMsg])
    } finally {
      setChatLoading(false)
      setActiveAgentId(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // --- Sales handlers ---
  const handleRecordSale = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!saleForm.productId) errors.productId = 'Please select a product'
    if (!saleForm.quantity || Number(saleForm.quantity) < 1) errors.quantity = 'Quantity must be at least 1'
    if (!saleForm.date) errors.date = 'Date is required'
    setSaleFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    const product = products.find(p => p.id === saleForm.productId)
    if (!product) return

    const qty = Number(saleForm.quantity)
    const newSale: Sale = {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      quantity: qty,
      unitPrice: product.price,
      totalAmount: qty * product.price,
      customerName: saleForm.customerName.trim() || undefined,
      paymentMethod: saleForm.paymentMethod,
      date: new Date(saleForm.date + 'T' + new Date().toTimeString().slice(0, 8)).toISOString(),
    }
    setSales(prev => [newSale, ...prev])
    setSaleSaveSuccess(true)
    setSaleForm({
      productId: '',
      quantity: '1',
      customerName: '',
      paymentMethod: 'cash',
      date: new Date().toISOString().split('T')[0]
    })
    setSaleFormErrors({})
    setTimeout(() => setSalesModalOpen(false), 1200)
  }, [saleForm, products])

  const handleDeleteSale = useCallback((id: string) => {
    setSales(prev => prev.filter(s => s.id !== id))
    setDeleteSaleConfirmId(null)
  }, [])

  const handleAIInsights = async () => {
    if (sales.length === 0) return
    setAiInsightsLoading(true)
    setActiveAgentId(AGENT_ID)
    try {
      const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
      const totalUnits = sales.reduce((sum, s) => sum + s.quantity, 0)
      const categoryBreakdown: Record<string, number> = {}
      const productSales: Record<string, number> = {}
      sales.forEach(s => {
        categoryBreakdown[s.category] = (categoryBreakdown[s.category] || 0) + s.totalAmount
        productSales[s.productName] = (productSales[s.productName] || 0) + s.quantity
      })
      const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5)
      const paymentBreakdown: Record<string, number> = {}
      sales.forEach(s => {
        paymentBreakdown[s.paymentMethod] = (paymentBreakdown[s.paymentMethod] || 0) + s.totalAmount
      })

      const prompt = `Analyze these retail clothing store sales data and provide insights:\n- Total Revenue: $${totalRevenue.toFixed(2)}\n- Total Units Sold: ${totalUnits}\n- Average Order Value: $${(totalRevenue / sales.length).toFixed(2)}\n- Number of Transactions: ${sales.length}\n- Category Breakdown: ${JSON.stringify(categoryBreakdown)}\n- Top Selling Products: ${topProducts.map(([name, qty]) => `${name} (${qty} units)`).join(', ')}\n- Payment Methods: ${JSON.stringify(paymentBreakdown)}\n\nProvide key insights, trends, and actionable recommendations for improving sales.`

      const result = await callAIAgent(prompt, AGENT_ID)
      const response = result?.response?.result?.response ?? result?.response?.message ?? 'Unable to generate insights.'
      const suggestions = Array.isArray(result?.response?.result?.suggestions) ? result.response.result.suggestions : []
      setAiInsights(response)
      setAiInsightsSuggestions(suggestions)
      setInsightsExpanded(true)
    } catch (e) {
      console.error('AI insights error:', e)
      setAiInsights('Failed to generate insights. Please try again.')
      setAiInsightsSuggestions([])
    } finally {
      setAiInsightsLoading(false)
      setActiveAgentId(null)
    }
  }

  // --- Sales computed values ---
  const filteredSales = sales.filter(s => {
    if (salesSearchQuery) {
      const q = salesSearchQuery.toLowerCase()
      if (!s.productName.toLowerCase().includes(q) && !s.sku.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false
    }
    return true
  })

  const salesTotalPages = Math.max(1, Math.ceil(filteredSales.length / ITEMS_PER_PAGE))
  const safeSalesPage = Math.min(salesPage, salesTotalPages)
  const paginatedSales = filteredSales.slice((safeSalesPage - 1) * ITEMS_PER_PAGE, safeSalesPage * ITEMS_PER_PAGE)

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
  const totalUnitsSold = sales.reduce((sum, s) => sum + s.quantity, 0)
  const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0
  const todayStr = mounted ? new Date().toISOString().split('T')[0] : ''
  const todaySales = sales.filter(s => s.date.startsWith(todayStr))
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0)

  const categoryRevenue: Record<string, number> = {}
  sales.forEach(s => {
    categoryRevenue[s.category] = (categoryRevenue[s.category] || 0) + s.totalAmount
  })
  const maxCategoryRevenue = Math.max(...Object.values(categoryRevenue), 1)
  const CHART_COLORS = [
    'hsl(27, 61%, 26%)',
    'hsl(43, 75%, 38%)',
    'hsl(30, 55%, 25%)',
    'hsl(35, 45%, 42%)',
    'hsl(20, 65%, 35%)',
  ]

  // --- Customer handlers ---
  const handleSaveCustomer = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!customerForm.name.trim()) errors.name = 'Name is required'
    if (!customerForm.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email)) errors.email = 'Invalid email format'
    if (!customerForm.phone.trim()) errors.phone = 'Phone is required'
    setCustomerFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? {
        ...c,
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
      } : c))
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
        totalPurchases: 0,
        totalSpent: 0,
        lastVisit: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      setCustomers(prev => [...prev, newCustomer])
    }
    setCustomerSaveSuccess(true)
    setTimeout(() => setCustomerModalOpen(false), 1200)
  }, [customerForm, editingCustomer])

  const handleDeleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id))
    setDeleteCustomerConfirmId(null)
  }, [])

  const openAddCustomerModal = useCallback(() => {
    setEditingCustomer(null)
    setCustomerForm({ name: '', email: '', phone: '' })
    setCustomerFormErrors({})
    setCustomerSaveSuccess(false)
    setCustomerModalOpen(true)
  }, [])

  const openEditCustomerModal = useCallback((customer: Customer) => {
    setEditingCustomer(customer)
    setCustomerForm({ name: customer.name, email: customer.email, phone: customer.phone })
    setCustomerFormErrors({})
    setCustomerSaveSuccess(false)
    setCustomerModalOpen(true)
  }, [])

  // --- Customers computed ---
  const filteredCustomers = customers.filter(c => {
    if (customerSearchQuery) {
      const q = customerSearchQuery.toLowerCase()
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.phone.includes(q)) return false
    }
    return true
  })
  const customerTotalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE))
  const safeCustomerPage = Math.min(customerPage, customerTotalPages)
  const paginatedCustomers = filteredCustomers.slice((safeCustomerPage - 1) * ITEMS_PER_PAGE, safeCustomerPage * ITEMS_PER_PAGE)

  // --- Format time ---
  const formatTime = (iso: string) => {
    if (!mounted) return ''
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const formatDate = (iso: string) => {
    if (!mounted) return ''
    try {
      const d = new Date(iso)
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return ''
    }
  }

  // ============================================================
  // RENDER: Inventory Dashboard
  // ============================================================
  function InventoryDashboard() {
    return (
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-wide">Inventory</h2>
            <p className="text-sm text-muted-foreground">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedProducts.size > 0 && (
              <Button variant="outline" size="sm" onClick={() => { setActiveSection('print-tags') }}>
                <Printer className="w-4 h-4 mr-2" />
                Print {selectedProducts.size} Tag{selectedProducts.size !== 1 ? 's' : ''}
              </Button>
            )}
            <Button size="sm" onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border/30 p-4 mb-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="pl-9 bg-background"
              />
            </div>

            {/* Category */}
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Size pills */}
            <div className="flex items-center gap-1">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSizeFilter(sizeFilter === s ? null : s); setCurrentPage(1) }}
                  className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${sizeFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border/50 hover:border-primary/50'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Color filter */}
            <Select value={colorFilter || 'all'} onValueChange={(v) => { setColorFilter(v === 'all' ? null : v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[130px] bg-background">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colors</SelectItem>
                {CLOTHING_COLORS.map((c) => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('table')} className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
          {(categoryFilter !== 'All' || sizeFilter || colorFilter || searchQuery) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {categoryFilter !== 'All' && <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setCategoryFilter('All')}>{categoryFilter} <X className="w-3 h-3 ml-1" /></Badge>}
              {sizeFilter && <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setSizeFilter(null)}>{sizeFilter} <X className="w-3 h-3 ml-1" /></Badge>}
              {colorFilter && <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setColorFilter(null)}>{colorFilter} <X className="w-3 h-3 ml-1" /></Badge>}
              {searchQuery && <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setSearchQuery('')}>"{searchQuery}" <X className="w-3 h-3 ml-1" /></Badge>}
            </div>
          )}
        </div>

        {/* Content */}
        {filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">Add your first item to start managing your inventory and printing price tags.</p>
            <Button size="sm" onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-card rounded-lg border border-border/30 shadow-sm overflow-hidden flex-1">
              <ScrollArea className="h-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/30">
                      <th className="p-3 text-left w-10">
                        <Checkbox
                          checked={paginatedProducts.length > 0 && selectedProducts.size === paginatedProducts.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Color</th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="p-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Barcode</th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                        </td>
                        <td className="p-3">
                          <code className="text-xs font-mono bg-secondary/50 px-2 py-0.5 rounded">{product.sku}</code>
                        </td>
                        <td className="p-3">
                          <span className="text-sm font-medium">{product.name}</span>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {product.sizes.map((s) => (
                              <span key={s} className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-border/50 inline-block" style={{ backgroundColor: CLOTHING_COLORS.find((c) => c.name === product.color)?.hex || '#ccc' }} />
                            <span className="text-xs text-muted-foreground">{product.color}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm font-semibold">${product.price.toFixed(2)}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center">{renderBarcodeSVG(product.sku, 100, 30)}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(product)}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedProducts(new Set([product.id])); setActiveSection('print-tags') }}>
                              <Printer className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteConfirmId(product.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  Showing {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(safeCurrentPage - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button key={p} variant={p === safeCurrentPage ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(p)} className="w-8 h-8 p-0">
                      {p}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(safeCurrentPage + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Grid view */
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProducts.map((product) => (
                <Card key={product.id} className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${selectedProducts.has(product.id) ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Checkbox
                            checked={selectedProducts.has(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                          <h3 className="font-medium text-sm">{product.name}</h3>
                        </div>
                        <code className="text-xs font-mono text-muted-foreground">{product.sku}</code>
                      </div>
                      <span className="text-lg font-serif font-semibold">${product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: CLOTHING_COLORS.find((c) => c.name === product.color)?.hex || '#ccc' }} />
                        <span className="text-xs text-muted-foreground">{product.color}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {product.sizes.map((s) => (
                        <span key={s} className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-center mb-3">{renderBarcodeSVG(product.sku, 160, 40)}</div>
                    <Separator className="mb-3" />
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7" onClick={() => openEditModal(product)}>
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7" onClick={() => { setSelectedProducts(new Set([product.id])); setActiveSection('print-tags') }}>
                        <Printer className="w-3 h-3 mr-1" /> Print
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirmId(product.id)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6 gap-1">
                <Button variant="outline" size="sm" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage(safeCurrentPage - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground mx-3">Page {safeCurrentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage(safeCurrentPage + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER: Add Product Section (standalone page)
  // ============================================================
  function AddProductSection() {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-semibold tracking-wide">Add New Product</h2>
          <p className="text-sm text-muted-foreground">Fill in the product details below. Use AI to suggest descriptions and pricing.</p>
        </div>
        <Card className="max-w-2xl shadow-md">
          <CardContent className="p-6">
            <ProductFormFields />
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/30">
              {saveSuccess && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Product saved
                </span>
              )}
              <Button variant="outline" onClick={() => setActiveSection('inventory')}>Cancel</Button>
              <Button onClick={handleSaveProduct}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================================
  // RENDER: Product Form Fields (shared between modal & section)
  // ============================================================
  function ProductFormFields() {
    return (
      <div className="space-y-5">
        {/* Name */}
        <div>
          <Label htmlFor="product-name" className="text-sm font-medium">Product Name *</Label>
          <Input
            id="product-name"
            placeholder="e.g., Heritage Cotton Oxford Shirt"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="mt-1.5"
          />
          {formErrors.name && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.name}</p>}
        </div>

        {/* SKU + Price row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="product-sku" className="text-sm font-medium">SKU *</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="product-sku"
                placeholder="RT-000000"
                value={formData.sku}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                className="font-mono"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => setFormData((prev) => ({ ...prev, sku: generateSKU() }))} title="Auto-generate SKU">
                <Hash className="w-4 h-4" />
              </Button>
            </div>
            {formErrors.sku && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.sku}</p>}
          </div>
          <div>
            <Label htmlFor="product-price" className="text-sm font-medium">Price (USD) *</Label>
            <div className="flex gap-2 mt-1.5">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className="pl-9"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAISuggestPrice} disabled={aiPriceLoading} title="AI suggest price">
                {aiPriceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
            {formErrors.price && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.price}</p>}
          </div>
        </div>

        {/* Category */}
        <div>
          <Label className="text-sm font-medium">Category *</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.category && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.category}</p>}
        </div>

        {/* Sizes */}
        <div>
          <Label className="text-sm font-medium">Sizes *</Label>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {SIZES.map((size) => (
              <SizePill
                key={size}
                size={size}
                selected={formData.sizes.includes(size)}
                onToggle={() => {
                  setFormData((prev) => ({
                    ...prev,
                    sizes: prev.sizes.includes(size)
                      ? prev.sizes.filter((s) => s !== size)
                      : [...prev.sizes, size]
                  }))
                }}
              />
            ))}
          </div>
          {formErrors.sizes && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.sizes}</p>}
        </div>

        {/* Color */}
        <div>
          <Label className="text-sm font-medium">Color *</Label>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {CLOTHING_COLORS.map((c) => (
              <ColorSwatch
                key={c.name}
                color={c}
                selected={formData.color === c.name}
                onSelect={() => setFormData((prev) => ({ ...prev, color: c.name }))}
              />
            ))}
          </div>
          {formData.color && <p className="text-xs text-muted-foreground mt-1.5">Selected: {formData.color}</p>}
          {formErrors.color && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.color}</p>}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="product-desc" className="text-sm font-medium">Description</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAISuggestDescription} disabled={aiDescLoading}>
              {aiDescLoading ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
              AI Suggest
            </Button>
          </div>
          <Textarea
            id="product-desc"
            placeholder="Enter product description or use AI to generate one..."
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="mt-1.5"
          />
        </div>

        {/* Barcode Preview */}
        {formData.sku && (
          <div>
            <Label className="text-sm font-medium">Barcode Preview</Label>
            <div className="mt-1.5 flex justify-center bg-white rounded-lg border border-border/30 p-4">
              {renderBarcodeSVG(formData.sku, 220, 70)}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER: Print Tags
  // ============================================================
  function PrintTagsSection() {
    const displayProducts = printProducts
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-wide">Print Tags</h2>
            <p className="text-sm text-muted-foreground">{displayProducts.length} tag{displayProducts.length !== 1 ? 's' : ''} ready to print</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Layout:</Label>
              <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
                <button onClick={() => setPrintLayout('2')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${printLayout === '2' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>
                  2-up
                </button>
                <button onClick={() => setPrintLayout('4')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${printLayout === '4' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}>
                  4-up
                </button>
              </div>
            </div>
            <Button onClick={handlePrint} disabled={displayProducts.length === 0}>
              <Printer className="w-4 h-4 mr-2" />
              Print Tags
            </Button>
          </div>
        </div>

        {displayProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 print:hidden">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Tag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold mb-2">No tags to print</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">Select products from the inventory or add new ones to generate printable price tags.</p>
            <Button size="sm" onClick={() => setActiveSection('inventory')}>
              <Package className="w-4 h-4 mr-2" />
              Go to Inventory
            </Button>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div id="print-area" className={`grid gap-4 ${printLayout === '4' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2'}`}>
              {displayProducts.map((product) => (
                <div key={product.id} className="bg-white border-2 border-foreground/10 rounded-lg p-5 text-center print:break-inside-avoid print:border print:border-black/30">
                  <p className="font-serif text-base font-semibold text-gray-900 mb-1">{product.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2 font-serif">${product.price.toFixed(2)}</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">{product.sku}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    {product.sizes.map((s) => (
                      <span key={s} className="text-xs border border-gray-300 px-1.5 py-0.5 rounded text-gray-700">{s}</span>
                    ))}
                    <span className="text-xs border border-gray-300 px-1.5 py-0.5 rounded text-gray-700 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300" style={{ backgroundColor: CLOTHING_COLORS.find((c) => c.name === product.color)?.hex || '#ccc' }} />
                      {product.color}
                    </span>
                  </div>
                  <div className="flex justify-center">{renderBarcodeSVG(product.sku, 180, 55)}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER: Sales Section
  // ============================================================
  function SalesSection() {
    const paymentIcon = (method: string) => {
      switch (method) {
        case 'cash': return <Banknote className="w-3.5 h-3.5" />
        case 'card': return <CreditCard className="w-3.5 h-3.5" />
        case 'upi': return <Smartphone className="w-3.5 h-3.5" />
        default: return <DollarSign className="w-3.5 h-3.5" />
      }
    }
    const paymentColor = (method: string) => {
      switch (method) {
        case 'cash': return 'bg-green-100 text-green-700 border-green-200'
        case 'card': return 'bg-blue-100 text-blue-700 border-blue-200'
        case 'upi': return 'bg-purple-100 text-purple-700 border-purple-200'
        default: return 'bg-secondary text-secondary-foreground'
      }
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-wide">Sales</h2>
            <p className="text-sm text-muted-foreground">{sales.length} transaction{sales.length !== 1 ? 's' : ''} recorded</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleAIInsights} disabled={aiInsightsLoading || sales.length === 0}>
              {aiInsightsLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              AI Sales Insights
            </Button>
            <Button size="sm" onClick={() => {
              setSaleForm({ productId: '', quantity: '1', customerName: '', paymentMethod: 'cash', date: new Date().toISOString().split('T')[0] })
              setSaleFormErrors({})
              setSaleSaveSuccess(false)
              setSalesModalOpen(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Record Sale
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(27, 61%, 26%, 0.12)' }}>
                  <DollarSign className="w-4.5 h-4.5" style={{ color: 'hsl(27, 61%, 26%)' }} />
                </div>
              </div>
              <p className="text-2xl font-serif font-semibold">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{sales.length} transactions</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Units Sold</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(43, 75%, 38%, 0.12)' }}>
                  <Package className="w-4.5 h-4.5" style={{ color: 'hsl(43, 75%, 38%)' }} />
                </div>
              </div>
              <p className="text-2xl font-serif font-semibold">{totalUnitsSold}</p>
              <p className="text-xs text-muted-foreground mt-1">across all categories</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Order Value</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(30, 55%, 25%, 0.12)' }}>
                  <BarChart3 className="w-4.5 h-4.5" style={{ color: 'hsl(30, 55%, 25%)' }} />
                </div>
              </div>
              <p className="text-2xl font-serif font-semibold">${averageOrderValue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">per transaction</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Today&apos;s Sales</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(35, 45%, 42%, 0.12)' }}>
                  <Calendar className="w-4.5 h-4.5" style={{ color: 'hsl(35, 45%, 42%)' }} />
                </div>
              </div>
              <p className="text-2xl font-serif font-semibold">${todayRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{todaySales.length} transaction{todaySales.length !== 1 ? 's' : ''} today</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <Card className="mb-6 shadow-sm border-primary/20">
            <CardContent className="p-0">
              <button
                onClick={() => setInsightsExpanded(!insightsExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">AI Sales Insights</span>
                </div>
                {insightsExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {insightsExpanded && (
                <div className="px-4 pb-4 border-t border-border/20">
                  <div className="mt-3">{renderMarkdown(aiInsights)}</div>
                  {Array.isArray(aiInsightsSuggestions) && aiInsightsSuggestions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/20">
                      <p className="text-xs text-muted-foreground mb-1.5">Recommendations:</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {aiInsightsSuggestions.map((sug, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{sug}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sales by Category Chart */}
        {Object.keys(categoryRevenue).length > 0 && (
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                Revenue by Category
              </h3>
              <div className="space-y-3">
                {Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1]).map(([cat, rev], i) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0 text-right">{cat}</span>
                    <div className="flex-1 bg-secondary/30 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{
                          width: `${Math.max((rev / maxCategoryRevenue) * 100, 8)}%`,
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
                        }}
                      >
                        <span className="text-xs font-medium text-white whitespace-nowrap">${rev.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales Search */}
        <div className="bg-card rounded-lg border border-border/30 p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search sales by product, SKU, or category..."
                value={salesSearchQuery}
                onChange={(e) => { setSalesSearchQuery(e.target.value); setSalesPage(1) }}
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Sales Table */}
        {filteredSales.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <TrendingUp className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold mb-2">No sales recorded</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">Start recording sales to track revenue, analyze trends, and get AI-powered insights.</p>
            <Button size="sm" onClick={() => {
              setSaleForm({ productId: '', quantity: '1', customerName: '', paymentMethod: 'cash', date: new Date().toISOString().split('T')[0] })
              setSaleFormErrors({})
              setSalesModalOpen(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Record First Sale
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="bg-card rounded-lg border border-border/30 shadow-sm overflow-hidden flex-1">
              <ScrollArea className="h-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/30">
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="p-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Price</th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                      <th className="p-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                        <td className="p-3">
                          <span className="text-xs text-muted-foreground">{formatDate(sale.date)}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm font-medium">{sale.productName}</span>
                        </td>
                        <td className="p-3">
                          <code className="text-xs font-mono bg-secondary/50 px-2 py-0.5 rounded">{sale.sku}</code>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{sale.category}</Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-muted-foreground">{sale.customerName || '--'}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-sm">{sale.quantity}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm">${sale.unitPrice.toFixed(2)}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm font-semibold">${sale.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${paymentColor(sale.paymentMethod)}`}>
                              {paymentIcon(sale.paymentMethod)}
                              {sale.paymentMethod.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteSaleConfirmId(sale.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>

            {/* Pagination */}
            {salesTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  Showing {(safeSalesPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(safeSalesPage * ITEMS_PER_PAGE, filteredSales.length)} of {filteredSales.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={safeSalesPage === 1} onClick={() => setSalesPage(safeSalesPage - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: salesTotalPages }, (_, i) => i + 1).map((p) => (
                    <Button key={p} variant={p === safeSalesPage ? 'default' : 'outline'} size="sm" onClick={() => setSalesPage(p)} className="w-8 h-8 p-0">
                      {p}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" disabled={safeSalesPage === salesTotalPages} onClick={() => setSalesPage(safeSalesPage + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER: Customers Section
  // ============================================================
  function CustomersSection() {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-wide">Customers</h2>
            <p className="text-sm text-muted-foreground">{customers.length} customer{customers.length !== 1 ? 's' : ''} in database</p>
          </div>
          <Button size="sm" onClick={openAddCustomerModal}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Customers</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(27, 61%, 26%, 0.12)' }}>
                  <Users className="w-4.5 h-4.5" style={{ color: 'hsl(27, 61%, 26%)' }} />
                </div>
              </div>
              <p className="text-2xl font-serif font-semibold">{customers.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Customer Spending</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(43, 75%, 38%, 0.12)' }}>
                  <DollarSign className="w-4.5 h-4.5" style={{ color: 'hsl(43, 75%, 38%)' }} />
                </div>
              </div>
              <p className="text-2xl font-serif font-semibold">${customers.reduce((s, c) => s + c.totalSpent, 0).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Spend / Customer</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(30, 55%, 25%, 0.12)' }}>
                  <BarChart3 className="w-4.5 h-4.5" style={{ color: 'hsl(30, 55%, 25%)' }} />
                </div>
              </div>
              <p className="text-2xl font-serif font-semibold">
                ${customers.length > 0 ? (customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-card rounded-lg border border-border/30 p-4 mb-4 shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={customerSearchQuery}
              onChange={(e) => { setCustomerSearchQuery(e.target.value); setCustomerPage(1) }}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold mb-2">No customers yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">Start building your customer database to track purchases and build loyalty.</p>
            <Button size="sm" onClick={openAddCustomerModal}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Customer
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="bg-card rounded-lg border border-border/30 shadow-sm overflow-hidden flex-1">
              <ScrollArea className="h-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/30">
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                      <th className="p-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Purchases</th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spent</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Visit</th>
                      <th className="p-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">{customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                            </div>
                            <span className="text-sm font-medium">{customer.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            {customer.email}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            {customer.phone}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary" className="text-xs">{customer.totalPurchases}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm font-semibold">${customer.totalSpent.toFixed(2)}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-muted-foreground">{formatDate(customer.lastVisit)}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditCustomerModal(customer)}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteCustomerConfirmId(customer.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>

            {/* Pagination */}
            {customerTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  Showing {(safeCustomerPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(safeCustomerPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={safeCustomerPage === 1} onClick={() => setCustomerPage(safeCustomerPage - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: customerTotalPages }, (_, i) => i + 1).map((p) => (
                    <Button key={p} variant={p === safeCustomerPage ? 'default' : 'outline'} size="sm" onClick={() => setCustomerPage(p)} className="w-8 h-8 p-0">
                      {p}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" disabled={safeCustomerPage === customerTotalPages} onClick={() => setCustomerPage(safeCustomerPage + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER: Chat / Store Assistant
  // ============================================================
  function StoreAssistant() {
    const quickPrompts = [
      'Suggest a description for a formal shirt',
      'What is a good price for casual jeans?',
      'Give me a category summary of my inventory',
      'Share some retail pricing tips',
    ]
    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto">
        <div className="mb-4">
          <h2 className="font-serif text-2xl font-semibold tracking-wide">Store Assistant</h2>
          <p className="text-sm text-muted-foreground">Ask about product descriptions, pricing, inventory management, or retail best practices.</p>
        </div>

        {/* Quick prompts */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendChat(prompt)}
              disabled={chatLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-card text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
          <ScrollArea className="flex-1 p-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">How can I help?</h3>
                <p className="text-sm text-muted-foreground max-w-sm">I can help you draft product descriptions, suggest pricing, answer inventory questions, and share retail best practices.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/30'} rounded-xl px-4 py-3 shadow-sm`}>
                      {msg.role === 'assistant' ? (
                        <div className="text-foreground">
                          {msg.category && msg.category !== 'general' && (
                            <Badge variant="outline" className="text-xs mb-2">{msg.category}</Badge>
                          )}
                          {renderMarkdown(msg.content)}
                          {Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-border/20">
                              <p className="text-xs text-muted-foreground mb-1.5">Suggestions:</p>
                              <div className="flex gap-1.5 flex-wrap">
                                {msg.suggestions.map((sug, i) => (
                                  <button
                                    key={i}
                                    onClick={() => handleSendChat(sug)}
                                    disabled={chatLoading}
                                    className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border/30 rounded-xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </ScrollArea>
          <div className="border-t border-border/30 p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about products, pricing, descriptions..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat() } }}
                disabled={chatLoading}
                className="flex-1"
              />
              <Button onClick={() => handleSendChat()} disabled={chatLoading || !chatInput.trim()}>
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex print:block" style={{ letterSpacing: '0.01em', lineHeight: '1.65' }}>
        {/* Print styles */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <div dangerouslySetInnerHTML={{ __html: `<${'style'} media="print">
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 1cm; }
        </${'style'}>` }} />

        {/* Sidebar */}
        <SidebarNav activeSection={activeSection} onNavigate={setActiveSection} />

        {/* Main */}
        <main className="flex-1 flex flex-col min-h-screen print:hidden overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border/30 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Quick search products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (activeSection !== 'inventory') setActiveSection('inventory') }}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="sample-toggle" className="text-sm text-muted-foreground">Sample Data</Label>
                <Switch id="sample-toggle" checked={sampleDataOn} onCheckedChange={setSampleDataOn} />
              </div>
              {activeAgentId && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="text-xs font-medium text-primary">AI Processing</span>
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'inventory' && <InventoryDashboard />}
            {activeSection === 'add-product' && <AddProductSection />}
            {activeSection === 'print-tags' && <PrintTagsSection />}
            {activeSection === 'sales' && <SalesSection />}
            {activeSection === 'customers' && <CustomersSection />}
            {activeSection === 'assistant' && <StoreAssistant />}
          </div>
        </main>

        {/* Add/Edit Product Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>{editingProduct ? 'Update the product details below.' : 'Fill in the product details. Use AI to suggest descriptions and pricing.'}</DialogDescription>
            </DialogHeader>
            <ProductFormFields />
            <DialogFooter className="mt-4">
              {saveSuccess && (
                <span className="text-sm text-green-600 flex items-center gap-1 mr-auto">
                  <Check className="w-4 h-4" /> Product saved successfully
                </span>
              )}
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProduct}>
                {editingProduct ? (
                  <><Check className="w-4 h-4 mr-2" />Update Product</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" />Add Product</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null) }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif">Delete Product</DialogTitle>
              <DialogDescription>Are you sure you want to delete this product? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteConfirmId && handleDeleteProduct(deleteConfirmId)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Sale Dialog */}
        <Dialog open={salesModalOpen} onOpenChange={setSalesModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Record a Sale</DialogTitle>
              <DialogDescription>Select a product and enter sale details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              {/* Product Select */}
              <div>
                <Label className="text-sm font-medium">Product *</Label>
                <Select value={saleForm.productId} onValueChange={(v) => setSaleForm(prev => ({ ...prev, productId: v }))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - ${p.price.toFixed(2)} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {saleFormErrors.productId && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{saleFormErrors.productId}</p>}
              </div>

              {/* Auto-filled product info */}
              {saleForm.productId && (() => {
                const selectedProd = products.find(p => p.id === saleForm.productId)
                if (!selectedProd) return null
                return (
                  <div className="bg-secondary/30 rounded-lg p-3 flex items-center gap-4 text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{selectedProd.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedProd.category} | {selectedProd.sku}</p>
                    </div>
                    <span className="font-serif font-semibold text-lg">${selectedProd.price.toFixed(2)}</span>
                  </div>
                )
              })()}

              {/* Quantity + Date row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sale-qty" className="text-sm font-medium">Quantity *</Label>
                  <Input
                    id="sale-qty"
                    type="number"
                    min="1"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="mt-1.5"
                  />
                  {saleFormErrors.quantity && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{saleFormErrors.quantity}</p>}
                </div>
                <div>
                  <Label htmlFor="sale-date" className="text-sm font-medium">Date *</Label>
                  <Input
                    id="sale-date"
                    type="date"
                    value={saleForm.date}
                    onChange={(e) => setSaleForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1.5"
                  />
                  {saleFormErrors.date && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{saleFormErrors.date}</p>}
                </div>
              </div>

              {/* Total preview */}
              {saleForm.productId && Number(saleForm.quantity) > 0 && (() => {
                const selectedProd = products.find(p => p.id === saleForm.productId)
                if (!selectedProd) return null
                const total = selectedProd.price * Number(saleForm.quantity)
                return (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Sale Total</p>
                    <p className="text-2xl font-serif font-semibold">${total.toFixed(2)}</p>
                  </div>
                )
              })()}

              {/* Customer Name */}
              <div>
                <Label htmlFor="sale-customer" className="text-sm font-medium">Customer Name (optional)</Label>
                <Input
                  id="sale-customer"
                  placeholder="Walk-in customer"
                  value={saleForm.customerName}
                  onChange={(e) => setSaleForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-sm font-medium">Payment Method</Label>
                <div className="flex gap-2 mt-1.5">
                  {([
                    { value: 'cash' as const, label: 'Cash', icon: Banknote },
                    { value: 'card' as const, label: 'Card', icon: CreditCard },
                    { value: 'upi' as const, label: 'UPI', icon: Smartphone },
                  ]).map(method => {
                    const Icon = method.icon
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setSaleForm(prev => ({ ...prev, paymentMethod: method.value }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${saleForm.paymentMethod === method.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border/50 hover:border-primary/50'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {method.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              {saleSaveSuccess && (
                <span className="text-sm text-green-600 flex items-center gap-1 mr-auto">
                  <Check className="w-4 h-4" /> Sale recorded
                </span>
              )}
              <Button variant="outline" onClick={() => setSalesModalOpen(false)}>Cancel</Button>
              <Button onClick={handleRecordSale}>
                <Check className="w-4 h-4 mr-2" />
                Record Sale
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Sale Confirmation Dialog */}
        <Dialog open={!!deleteSaleConfirmId} onOpenChange={(open) => { if (!open) setDeleteSaleConfirmId(null) }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif">Delete Sale Record</DialogTitle>
              <DialogDescription>Are you sure you want to delete this sale record? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteSaleConfirmId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteSaleConfirmId && handleDeleteSale(deleteSaleConfirmId)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Customer Dialog */}
        <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
              <DialogDescription>{editingCustomer ? 'Update customer details.' : 'Add a new customer to your database.'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cust-name" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="cust-name"
                  placeholder="e.g., Priya Sharma"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1.5"
                />
                {customerFormErrors.name && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{customerFormErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="cust-email" className="text-sm font-medium">Email *</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cust-email"
                    type="email"
                    placeholder="email@example.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-9"
                  />
                </div>
                {customerFormErrors.email && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{customerFormErrors.email}</p>}
              </div>
              <div>
                <Label htmlFor="cust-phone" className="text-sm font-medium">Phone *</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cust-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-9"
                  />
                </div>
                {customerFormErrors.phone && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{customerFormErrors.phone}</p>}
              </div>
            </div>
            <DialogFooter className="mt-4">
              {customerSaveSuccess && (
                <span className="text-sm text-green-600 flex items-center gap-1 mr-auto">
                  <Check className="w-4 h-4" /> {editingCustomer ? 'Customer updated' : 'Customer added'}
                </span>
              )}
              <Button variant="outline" onClick={() => setCustomerModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCustomer}>
                {editingCustomer ? (
                  <><Check className="w-4 h-4 mr-2" />Update Customer</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" />Add Customer</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Customer Confirmation Dialog */}
        <Dialog open={!!deleteCustomerConfirmId} onOpenChange={(open) => { if (!open) setDeleteCustomerConfirmId(null) }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif">Delete Customer</DialogTitle>
              <DialogDescription>Are you sure you want to remove this customer from your database? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteCustomerConfirmId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteCustomerConfirmId && handleDeleteCustomer(deleteCustomerConfirmId)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
