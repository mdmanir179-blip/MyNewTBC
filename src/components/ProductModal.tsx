import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  ShoppingBag,
  Check,
  Zap
} from 'lucide-react';
import { WmsProduct, Platform } from '../types/wms';
import { compressAndUploadImage } from '../utils/imageCompressor';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: WmsProduct | null;
  onSaveProduct: (product: WmsProduct) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
  lang?: 'en' | 'bn';
}

const PLATFORMS: Platform[] = ['Amazon', 'Flipkart', 'Blinkit', 'Meesho', 'Myntra', 'Other'];

const PRODUCT_PRESETS = [
  {
    labelEn: 'Wireless Headphones',
    title: 'boAt Rockerz 450 Bluetooth Wireless Headphone',
    brand: 'boAt',
    platform: 'Amazon' as Platform,
    price: 1499,
    cashback: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80',
    type: '100% Free' as const,
    slots: 50
  },
  {
    labelEn: 'Smart Fitness Watch',
    title: 'Noise ColorFit Pulse AMOLED Smartwatch v2',
    brand: 'Noise',
    platform: 'Flipkart' as Platform,
    price: 2499,
    cashback: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80',
    type: '100% Free' as const,
    slots: 40
  },
  {
    labelEn: 'Coffee Tumbler',
    title: 'Insulated Stainless Steel Coffee Travel Tumbler 500ml',
    brand: 'ThermosPro',
    platform: 'Blinkit' as Platform,
    price: 899,
    cashback: 899,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&q=80',
    type: '100% Free' as const,
    slots: 60
  },
  {
    labelEn: 'Gaming Mouse',
    title: 'Razer DeathAdder Essential Gaming Mouse 6400 DPI',
    brand: 'Razer',
    platform: 'Amazon' as Platform,
    price: 1299,
    cashback: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&q=80',
    type: '100% Free' as const,
    slots: 35
  }
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  onShowToast,
  lang = 'en'
}) => {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [platform, setPlatform] = useState<Platform>('Amazon');
  const [originalPrice, setOriginalPrice] = useState<number>(999);
  const [cashbackAmount, setCashbackAmount] = useState<number>(999);
  const [cashbackType, setCashbackType] = useState<'100% Free' | 'Flat Cashback' | 'Review Bonus'>('100% Free');
  const [specialCode, setSpecialCode] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [totalSlots, setTotalSlots] = useState<number>(50);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [instructions, setInstructions] = useState<string[]>([
    'Buy directly via the official purchase link',
    'Do not apply unverified 3rd-party store coupons',
    'Upload clear order invoice & review screenshot upon delivery'
  ]);

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setBrand(productToEdit.brand);
      setPlatform(productToEdit.platform);
      setOriginalPrice(productToEdit.originalPrice);
      setCashbackAmount(productToEdit.cashbackAmount);
      setCashbackType(productToEdit.cashbackType);
      setSpecialCode(productToEdit.specialCode);
      setPurchaseUrl(productToEdit.purchaseUrl);
      setImageUrl(productToEdit.imageUrl);
      setTotalSlots(productToEdit.totalSlots);
      setInstructions(productToEdit.instructions && productToEdit.instructions.length > 0 ? productToEdit.instructions : ['Buy on store', 'Upload proofs']);
    } else {
      resetForm();
    }
  }, [productToEdit, isOpen]);

  const resetForm = () => {
    setTitle('');
    setBrand('');
    setPlatform('Amazon');
    setOriginalPrice(999);
    setCashbackAmount(999);
    setCashbackType('100% Free');
    setSpecialCode(`AMZ-${Math.floor(1000 + Math.random() * 9000)}`);
    setPurchaseUrl('');
    setImageUrl('');
    setTotalSlots(50);
    setInstructions([
      'Buy directly via the official purchase link',
      'Do not apply unverified 3rd-party store coupons',
      'Upload clear order invoice & review screenshot upon delivery'
    ]);
  };

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const prefix = platform === 'Amazon' ? 'AMZ' : platform === 'Flipkart' ? 'FLP' : platform === 'Blinkit' ? 'BLK' : platform === 'Meesho' ? 'MSH' : 'TBC';
    const rand = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${rand}`;
    setSpecialCode(code);
    onShowToast('info', 'Code Generated', `Generated ${code}`);
  };

  const applyPreset = (preset: typeof PRODUCT_PRESETS[0]) => {
    setTitle(preset.title);
    setBrand(preset.brand);
    setPlatform(preset.platform);
    setOriginalPrice(preset.price);
    setCashbackAmount(preset.cashback);
    setCashbackType(preset.type);
    setImageUrl(preset.imageUrl);
    setTotalSlots(preset.slots);
    const prefix = preset.platform === 'Amazon' ? 'AMZ' : preset.platform === 'Flipkart' ? 'FLP' : 'BLK';
    setSpecialCode(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
    onShowToast('success', 'Preset Applied', preset.title);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        onShowToast('error', 'Image Too Large', 'Please select an image file under 15MB.');
        return;
      }
      setIsUploadingImage(true);
      try {
        const finalUrl = await compressAndUploadImage(file);
        setImageUrl(finalUrl);
        onShowToast(
          'success',
          'Photo Attached',
          `${file.name} successfully attached and optimized.`
        );
      } catch (err) {
        console.error('Image upload failed:', err);
        onShowToast('error', 'Upload Failed', 'Failed to process image file. Please try another image.');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!title.trim() || !specialCode.trim()) {
      onShowToast(
        'error',
        'Missing Information',
        'Product title and special verification code are required.'
      );
      return;
    }

    const fallbackImg =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

    const saved: WmsProduct = {
      id: productToEdit ? productToEdit.id : `PROD-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      brand: brand.trim() || 'Official Brand',
      platform,
      imageUrl: fallbackImg,
      originalPrice: Number(originalPrice) || 999,
      cashbackAmount: Number(cashbackAmount) || 999,
      cashbackType,
      specialCode: specialCode.trim().toUpperCase(),
      purchaseUrl: purchaseUrl.trim() || 'https://amazon.in',
      totalSlots: Number(totalSlots) || 50,
      claimedSlots: productToEdit ? productToEdit.claimedSlots : 0,
      status: productToEdit ? productToEdit.status : 'active',
      instructions: instructions.filter((i) => i.trim().length > 0),
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString().slice(0, 10)
    };

    onSaveProduct(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {productToEdit
                  ? 'Edit Reward Product'
                  : 'Create New Cashback Product Offer'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure product details, mandatory verification code, and payout rewards
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Quick Presets */}
        {!productToEdit && (
          <div className="px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                1-Click Quick Product Presets
              </span>
              <span className="text-[10px] text-slate-500">
                Click any preset to autofill
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pb-2">
              {PRODUCT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{preset.labelEn}</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">₹{preset.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wireless ANC Pro Studio Headphones"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Brand / Seller Name
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. boAt / Samsung / Noise"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Platform */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Merchant Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => {
                  const newPlat = e.target.value as Platform;
                  setPlatform(newPlat);
                  const prefix = newPlat === 'Amazon' ? 'AMZ' : newPlat === 'Flipkart' ? 'FLP' : newPlat === 'Blinkit' ? 'BLK' : newPlat === 'Meesho' ? 'MSH' : 'TBC';
                  setSpecialCode(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Original Price */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Original Price (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={originalPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setOriginalPrice(val);
                  if (cashbackType === '100% Free') {
                    setCashbackAmount(val);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Cashback Amount */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Cashback Payout (₹) *
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCashbackAmount(originalPrice)}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                  >
                    100% Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashbackAmount(Math.round(originalPrice / 2))}
                    className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200"
                  >
                    50% Off
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="1"
                required
                value={cashbackAmount}
                onChange={(e) => setCashbackAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-emerald-700 font-mono font-bold focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Cashback Type */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Cashback Offer Type
              </label>
              <select
                value={cashbackType}
                onChange={(e) => {
                  const type = e.target.value as any;
                  setCashbackType(type);
                  if (type === '100% Free') {
                    setCashbackAmount(originalPrice);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              >
                <option value="100% Free">100% Free (Full Refund)</option>
                <option value="Flat Cashback">Flat Cashback Amount</option>
                <option value="Review Bonus">Review Bonus Incentive</option>
              </select>
            </div>

            {/* Total Slots */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Total Campaign Slots
              </label>
              <input
                type="number"
                min="1"
                value={totalSlots}
                onChange={(e) => setTotalSlots(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Special Code Generator */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Special Verification Code (Customer Must Enter This Code) *
                </label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={specialCode}
                onChange={(e) => setSpecialCode(e.target.value.toUpperCase())}
                placeholder="e.g. AMZ-9821"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-indigo-700 uppercase tracking-wider focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Product Image URL or File Upload */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Product Image (Upload Photo or Paste URL)
              </label>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or choose file"
                  className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />

                <label className={`cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-colors ${isUploadingImage ? 'opacity-60 pointer-events-none' : ''}`}>
                  <Upload className={`w-3.5 h-3.5 text-indigo-600 ${isUploadingImage ? 'animate-bounce' : ''}`} />
                  <span>
                    {isUploadingImage
                      ? 'Optimizing & Uploading...'
                      : 'Choose Device Photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImage}
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {imageUrl && (
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-emerald-700 block">
                      ✓ Product Photo Attached
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      Ready to be displayed on offer card
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-rose-600 hover:underline px-2 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Purchase Link */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Store Purchase Link (Amazon/Flipkart/Blinkit)
              </label>
              <input
                type="url"
                value={purchaseUrl}
                onChange={(e) => setPurchaseUrl(e.target.value)}
                placeholder="https://www.amazon.in/dp/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {productToEdit
                  ? 'Save Changes'
                  : 'Publish Offer Product'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
