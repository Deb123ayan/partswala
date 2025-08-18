'use client';
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShoppingCart, Heart, Star, User, Bell, X, ChevronDown, ChevronUp, Menu, MapPin, Info, Image } from 'lucide-react';
import PocketBase from 'pocketbase';

// Initialize PocketBase client
const pb = new PocketBase('https://balancej.pockethost.io'); // Replace with your PocketBase URL

// Define types
interface Product {
  id: any;
  name: string;
  category: string;
  price: number;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  brand: string;
  colors: string[];
  sizes: string[];
  description: string;
  specifications: string;
  created: string;
  updated: string;
}

// NEW: Define type for shop schedule
interface ShopSchedule {
  day: number;
  open: string; // Assuming HH:MM format as string
  close: string; // Assuming HH:MM format as string
}

type CartItem = Product & {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
};

type Category = {
  id: string;
  name: string;
  icon: JSX.Element;
};

type Order = {
  id: string;
  created: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  deliveryDate: string;
  products: {
    productId: number;
    name: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<string>('name');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [checkoutInfo, setCheckoutInfo] = useState({
    email: '',
    phone: '',
    deliveryAddress: '',
    deliveryDate: ''
  });
  const [productSelections, setProductSelections] = useState<{
    [productId: string]: { selectedColor?: string; selectedSize?: string };
  }>({});
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // NEW: State for shop schedule
  const [shopSchedule, setShopSchedule] = useState<ShopSchedule[]>([]);

  // NEW: Function to fetch shop schedule from PocketBase
  const fetchShopSchedule = useCallback(async () => {
    try {
      // Use getList or getFullList depending on your needs. getFullList is fine if the list is small.
      // Ensure the collection name 'shop_schedule' matches what you created in PocketBase.
      const records = await pb.collection('shop_schedule').getFullList({
        sort: 'day', // Optional: sort by day
        requestKey: `fetchShopSchedule_${Date.now()}`, // Optional: unique request key
      });
      // Ensure the data conforms to ShopSchedule type
      const scheduleData: ShopSchedule[] = records.map((record: any) => ({
        day: record.day,
        open: record.open,
        close: record.close,
      }));
      setShopSchedule(scheduleData);
    } catch (err) {
      console.error('Failed to fetch shop schedule:', err);
      // Optionally set default schedule or keep empty
      setShopSchedule([]); // Or set a default schedule if fetch fails
    }
  }, []); // Empty dependency array as it doesn't depend on props/state

  // Modified Function to check shop status based on fetched schedule
  const checkShopStatus = useCallback(() => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000); // Convert to UTC
    const istTime = new Date(utc + istOffset); // Convert UTC to IST

    const day = istTime.getDay(); // 0 (Sunday) to 6 (Saturday)
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();

    // Format current time for display in the banner
    const formattedTime = istTime.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
    });
    setCurrentTime(formattedTime);

    let isOpen = false;

    // Find the schedule for the current day
    const todaySchedule = shopSchedule.find(schedule => schedule.day === day);

    if (todaySchedule) {
      // Parse the open and close times (assuming HH:MM format)
      const [openHourStr, openMinuteStr] = todaySchedule.open.split(':');
      const [closeHourStr, closeMinuteStr] = todaySchedule.close.split(':');

      const openHour = parseInt(openHourStr, 10);
      const openMinute = parseInt(openMinuteStr, 10);
      const closeHour = parseInt(closeHourStr, 10);
      const closeMinute = parseInt(closeMinuteStr, 10);

      // Basic validation
      if (!isNaN(openHour) && !isNaN(openMinute) && !isNaN(closeHour) && !isNaN(closeMinute)) {
        const currentTimeInMinutes = hours * 60 + minutes;
        const openTimeInMinutes = openHour * 60 + openMinute;
        const closeTimeInMinutes = closeHour * 60 + closeMinute;

        // Check if current time is within open/close range
        // Assumes close time is on the same day. Adjust logic if shop closes after midnight.
        if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
          isOpen = true;
        }
      } else {
        console.warn(`Invalid time format in schedule for day ${day}: open=${todaySchedule.open}, close=${todaySchedule.close}`);
      }
    } else {
      console.warn(`No schedule found for day ${day}`);
      // Optionally, assume closed if no schedule exists for the day
    }

    setIsShopOpen(isOpen);
  }, [shopSchedule]); // Depend on shopSchedule so it re-runs when schedule is fetched

  // Fetch shop schedule on component mount
  useEffect(() => {
    fetchShopSchedule();
  }, [fetchShopSchedule]);

  // Check shop status initially and then every minute
  // Re-run effect when checkShopStatus changes (which depends on shopSchedule)
  useEffect(() => {
    checkShopStatus(); // Check immediately on mount and when schedule loads/changes
    const interval = setInterval(checkShopStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [checkShopStatus]); // Add checkShopStatus as dependency

  // Fetch order history function with AbortController
  const fetchOrderHistory = async (signal?: AbortSignal) => {
    if (!pb.authStore.model) {
      setOrderHistory([]);
      return;
    }
    try {
      const result = await pb.collection('order').getFullList(undefined, {
        filter: `email = "${pb.authStore.model.email}"`,
        sort: '-created',
        requestKey: `fetchOrderHistory_${Date.now()}`,
        signal
      });
      setOrderHistory(result as any);
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && (err as any).name !== 'AbortError') {
        console.error('Error fetching order history:', err);
      }
    }
  };

  // Fetch user email and order history if logged in
  useEffect(() => {
    if (!pb.authStore.model) {
      setOrderHistory([]);
      setCheckoutInfo(prev => ({ ...prev, email: '' }));
      return;
    }
    setCheckoutInfo(prev => ({
      ...prev,
      email: pb.authStore.model?.email || ''
    }));
    const abortController = new AbortController();
    fetchOrderHistory(abortController.signal);
    return () => {
      console.log('Cleaning up order history fetch');
      abortController.abort();
    };
  }, [pb.authStore.model?.id]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Categories data
  const categories: Category[] = [
    {
      id: 'all',
      name: 'All Products',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M3 10h18M7 15h1m4 0h1m4 0h1M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
      </svg>
    },
    {
      id: 'gears',
      name: 'Gears',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeWidth="2" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" strokeWidth="2" />
      </svg>
    },
    {
      id: 'clutches',
      name: 'Clutches',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M6 6h12v12H6V6z" strokeWidth="2" />
        <path d="M9 3h6v3H9V3z" strokeWidth="2" />
      </svg>
    },
    {
      id: 'brakes',
      name: 'Brakes',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" strokeWidth="2" />
        <path d="M12 6v6l4 2" strokeWidth="2" />
      </svg>
    },
    {
      id: 'motor_parts',
      name: 'Motor Parts',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4 12h16m-16 0v5a2 2 0 002 2h12a2 2 0 002-2v-5m-16 0l1-6h14l1 6" strokeWidth="2" />
      </svg>
    },
  ];

  const colors = ['Silver', 'Black', 'Gray', 'Red', 'Blue'];
  const sizes = ['Small', 'Medium', 'Large'];

  // Products data with additional fields
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await pb.collection('products').getList(1, 30, {
        sort: '-created',
        requestKey: `fetch_products_${Date.now()}`,
      });
      const formattedProducts = result.items.map((p: any) => ({
        id: p.id,
        name: p.name || '',
        category: p.category || '',
        price: p.price || 0,
        image: pb.getFileUrl(p, p.image || ''),
        images: Array.isArray(p.images) ? p.images.map((img: string) => pb.getFileUrl(p, img)) : [],
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        brand: p.brand || '',
        colors: typeof p.colors === 'string' ? p.colors.split(',').map((c: string) => c.trim()) : [],
        sizes: typeof p.sizes === 'string' ? p.sizes.split(',').map((s: string) => s.trim()) : [],
        description: p.description || '',
        specifications: typeof p.specifications === 'object' ? JSON.stringify(p.specifications) : p.specifications || '',
        created: p.created || '',
        updated: p.updated || ''
      }));
      setProducts(formattedProducts);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Add to cart function
  const handleAddToCart = (product: Product, color?: string, size?: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item =>
        item.id === product.id &&
        item.selectedColor === color &&
        item.selectedSize === size
      );
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id &&
            item.selectedColor === color &&
            item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            ...product,
            quantity: 1,
            selectedColor: color,
            selectedSize: size
          }
        ];
      }
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Improved search and filter with defensive checks
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' ||
      (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = (
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesColor = selectedColors.length === 0 ||
      (product.colors && product.colors.some(color => selectedColors.includes(color)));
    const matchesSize = selectedSizes.length === 0 ||
      (product.sizes && product.sizes.some(size => selectedSizes.includes(size)));
    return matchesCategory && matchesSearch && matchesPrice && matchesColor && matchesSize;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'reviews': return b.reviews - a.reviews;
      default: return (a.name || '').localeCompare(b.name || '');
    }
  });

  // Cart functions
  const addToCart = (product: Product, color?: string, size?: string) => {
    if (product.colors && product.colors.length > 0 && !color) {
      alert('Please select a color before adding to cart');
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !size) {
      alert('Please select a size before adding to cart');
      return;
    }
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item =>
        item.id === product.id &&
        item.selectedColor === color &&
        item.selectedSize === size
      );
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id &&
            item.selectedColor === color &&
            item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, {
          ...product,
          quantity: 1,
          selectedColor: color,
          selectedSize: size
        }];
      }
    });
  };

  // Handle color and size selection for main product grid
  const selectColor = (productId: string, color: string) => {
    setProductSelections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selectedColor: color
      }
    }));
  };

  const selectSize = (productId: number, size: string) => {
    setProductSelections(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selectedSize: size
      }
    }));
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Toggle like status
  const toggleLike = (productId: number) => {
    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(productId)) {
      newLikedItems.delete(productId);
    } else {
      newLikedItems.add(productId);
    }
    setLikedItems(newLikedItems);
  };

  // Toggle color filter
  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  // Toggle size filter
  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 30000]);
    setSortBy('name');
  };

  // Handle sign out
  const handleSignOut = () => {
    pb.authStore.clear();
    router.push("./signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 relative">
      {/* Shop Status Banner */}
      <div className={`fixed top-0 left-0 right-0 z-50 p-4 text-center text-white font-medium text-lg transition-all duration-300 ${isShopOpen ? 'bg-green-600' : 'bg-red-600'}`}>
        {isShopOpen ? (
          <span>Shop is Open! </span>
        ) : (
          <span>Shop is Closed </span>
        )}
       
      </div>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 border-b border-blue-800 sticky top-12 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="lg:hidden flex items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-blue-100 hover:text-white rounded-full hover:bg-blue-800 transition-all"
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            </div>
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <div className="flex items-center">
                <div
                  className="bg-gradient-to-br from-blue-900 to-blue-700 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center overflow-hidden rounded-xl shadow-md"
                  style={{
                    backgroundImage: "url('https://jm.partswala.in/assets/images/jmlogo.jpg')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  <img
                    src="https://jm.partswala.in/assets/images/jmlogo.jpg"
                    alt="Parts Wala Logo"
                    className="hidden"
                  />
                </div>
                <div className="ml-3">
                  <h1 className="text-2xl md:text-3xl font-serif font-extrabold bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-500 text-transparent bg-clip-text tracking-tight">
                    PARTS WALA
                  </h1>
                  <p className="text-xs md:text-sm text-teal-200 tracking-widest uppercase mt-1 hidden md:block">
                    Motor Parts & Accessories
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-300 bg-blue-50 text-blue-900 placeholder-blue-400 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="hidden lg:flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-blue-100 hover:text-white rounded-full hover:bg-blue-800 transition-all"
                  onClick={() => router.push('./about')}
                >
                  <Info className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-blue-100 hover:text-white rounded-full hover:bg-blue-800 transition-all"
                  onClick={() => window.open('https://www.bing.com/maps?&ty=18&q=Jyeshtha%20Motors&ss=ypid.YN4070x4481910013197430905&mb=20.477441~85.831783~20.468888~85.846975&description=Khata%20No.74%2C%20Plot%20No.%207%2C%20Manguli%2C%20Near%20Eicher%20Show%20Room%2C%20Sangam%20Ware%20House%2C%20Choudwar%2C%20Cuttack%2C%20Odisha%20754025%C2%B7Motorcycle%20dealer&cardbg=%23F98745&dt=1753173000000&tt=Jyeshtha%20Motors&tsts0=%2526ty%253D18%2526q%253DJyeshtha%252520Motors%2526ss%253Dypid.YN4070x4481910013197430905%2526mb%253D20.477441~85.831783~20.468888~85.846975%2526description%253DKhata%252520No.74%25252C%252520Plot%252520No.%2525207%25252C%252520Manguli%25252C%252520Near%252520Eicher%252520Show%252520Room%25252C%252520Sangam%252520Ware%252520House%25252C%252520Choudwar%25252C%252520Cuttack%25252C%252520Odisha%252520754025%2525C2%2525B7Motorcycle%252520dealer%2526cardbg%253D%252523F98745%2526dt%253D1753173000000&tstt0=Jyeshtha%20Motors&cp=20.473165~85.836718&lvl=17&pi=0&ftst=0&ftics=False&v=2&sV=2&form=S00027')}
                >
                  <MapPin className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-blue-100 hover:text-white rounded-full hover:bg-blue-800 transition-all"
                  onClick={() => router.push('./gallery')}
                >
                  <Image className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-blue-100 hover:text-white rounded-full hover:bg-blue-800 transition-all"
                  onClick={() => router.push('./profile')}
                >
                  <User className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-blue-100 hover:text-white rounded-full hover:bg-blue-800 transition-all"
                  onClick={() => router.push('./notification')}
                >
                  <Bell className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="px-5 py-2.5 bg-white text-blue-700 rounded-xl hover:bg-yellow-300 hover:text-blue-900 transition-all shadow-md font-medium"
                >
                  Sign Out
                </motion.button>
              </div>
            </div>
          </div>
          <div className="lg:hidden pb-4 px-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all duration-300 bg-blue-50 text-blue-900 placeholder-blue-400 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-blue-700 to-blue-900 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-blue-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold text-white">Menu</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-full hover:bg-blue-800 transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-blue-800 text-white transition-all"
                  onClick={() => {
                    router.push('/about');
                    setShowMobileMenu(false);
                  }}
                >
                  <Info className="w-5 h-5 text-blue-200" />
                  <span className="text-base font-medium">About Us</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-blue-800 text-white transition-all"
                  onClick={() => {
                    router.push('/locate');
                    setShowMobileMenu(false);
                  }}
                >
                  <MapPin className="w-5 h-5 text-blue-200" />
                  <span className="text-base font-medium">Locate Us</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-blue-800 text-white transition-all"
                  onClick={() => {
                    router.push('/gallery');
                    setShowMobileMenu(false);
                  }}
                >
                  <Image className="w-5 h-5 text-blue-200" />
                  <span className="text-base font-medium">Gallery</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-blue-800 text-white transition-all"
                  onClick={() => {
                    router.push('/profile');
                    setShowMobileMenu(false);
                  }}
                >
                  <User className="w-5 h-5 text-blue-200" />
                  <span className="text-base font-medium">Profile</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-blue-800 text-white transition-all"
                  onClick={() => {
                    router.push('/notification');
                    setShowMobileMenu(false);
                  }}
                >
                  <Bell className="w-5 h-5 text-blue-200" />
                  <span className="text-base font-medium">Notifications</span>
                </motion.button>
              </div>
              <div className="p-6 border-t border-blue-600">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleSignOut();
                    setShowMobileMenu(false);
                  }}
                  className="w-full px-5 py-3 bg-white text-blue-700 rounded-xl hover:bg-yellow-300 hover:text-blue-900 transition-all shadow-md font-medium"
                >
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-md border border-blue-300 p-6">
                <h3 className="text-xl font-serif font-bold text-blue-900 mb-5">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${selectedCategory === category.id
                          ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                          : 'text-blue-700 hover:bg-blue-100 hover:shadow-sm'
                        }`}
                    >
                      <span className={`${selectedCategory === category.id ? 'text-yellow-400' : 'text-blue-500'}`}>
                        {category.icon}
                      </span>
                      <span className="text-base font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-md border border-blue-300 p-6">
                <h3 className="text-xl font-serif font-bold text-blue-900 mb-5">Price Range</h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-blue-700 mb-3">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="30000"
                      step="1000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full mb-4 accent-blue-600"
                    />
                    <input
                      type="range"
                      min="0"
                      max="30000"
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-md border border-blue-300 p-6">
                <h3 className="text-xl font-serif font-bold text-blue-900 mb-5">Colors</h3>
                <div className="grid grid-cols-3 gap-3">
                  {colors.map(color => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleColor(color)}
                      className={`flex items-center justify-center py-2 px-3 rounded-xl text-sm font-medium transition-all shadow-sm ${selectedColors.includes(color)
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      {color}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-md border border-blue-300 p-6">
                <h3 className="text-xl font-serif font-bold text-blue-900 mb-5">Sizes</h3>
                <div className="grid grid-cols-3 gap-3">
                  {sizes.map(size => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleSize(size)}
                      className={`flex items-center justify-center py-2 px-3 rounded-xl text-sm font-medium transition-all shadow-sm ${selectedSizes.includes(size)
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-md border border-blue-300 p-6">
                <h3 className="text-xl font-serif font-bold text-blue-900 mb-5">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-base bg-blue-50 text-blue-900 shadow-sm transition-all"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-serif font-bold text-blue-900">
                  {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-blue-700 mt-2 text-base">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>
              {isMobile && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFilters}
                  className="px-5 py-3 bg-blue-100 border border-blue-300 rounded-xl hover:bg-blue-200 transition-all shadow-sm text-base font-medium text-blue-900"
                >
                  Reset
                </motion.button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-md border border-blue-300 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative h-56 md:h-64 bg-blue-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/fallback.jpg';
                        }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product.id);
                        }}
                        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${likedItems.has(product.id) ? 'fill-red-500 text-red-500' : 'text-blue-500 hover:text-red-500'
                            }`}
                        />
                      </motion.button>
                      {product.rating >= 4.5 && (
                        <div className="absolute top-4 left-4 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm">
                          <Star className="w-4 h-4 fill-blue-900 mr-1" />
                          Premium
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold text-blue-900 text-lg md:text-xl line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-blue-700 font-medium mt-1">{product.brand}</p>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-blue-700 ml-1 font-medium">{product.rating}</span>
                        </div>
                        <span className="text-sm text-blue-500">({product.reviews} reviews)</span>
                      </div>
                      <div className="mb-4 space-y-3">
                        {product.colors && product.colors.length > 0 && (
                          <div>
                            <p className="text-xs text-blue-600 font-medium mb-1.5">Colors</p>
                            <div className="flex space-x-2">
                              {product.colors.map(color => (
                                <motion.button
                                  key={color}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectColor(product.id, color);
                                  }}
                                  className={`w-7 h-7 rounded-full border-2 shadow-sm transition-all ${productSelections[product.id]?.selectedColor === color
                                      ? 'border-blue-600 scale-110'
                                      : 'border-blue-300'
                                    }`}
                                  style={{ backgroundColor: color.toLowerCase() }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {product.sizes && product.sizes.length > 0 && (
                          <div>
                            <p className="text-xs text-blue-600 font-medium mb-1.5">Sizes</p>
                            <div className="flex flex-wrap gap-2">
                              {product.sizes.map(size => (
                                <motion.button
                                  key={size}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectSize(product.id, size);
                                  }}
                                  className={`text-sm font-semibold px-3 py-1.5 border rounded-xl transition-all ${productSelections[product.id]?.selectedSize === size
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                                    }`}
                                >
                                  {size}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl md:text-2xl font-bold text-blue-900">{formatPrice(product.price)}</span>
                          {product.price > 10000 && (
                            <p className="text-xs text-green-600 mt-1.5 font-medium">Free Shipping</p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => window.open('https://api.whatsapp.com/send/?phone=%2B919583967497')}
                          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all shadow-md text-base font-medium"
                        >
                          Contact Us
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-blue-300">
                <div className="text-7xl mb-4 text-blue-300">🔍</div>
                <h3 className="text-2xl font-semibold text-blue-900 mb-3">No products found</h3>
                <p className="text-blue-700 mb-6 text-base">Try adjusting your search or filters</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-md text-base font-medium"
                >
                  Reset Filters
                </motion.button>
              </div>
            )}
          </div>
        </div>
        {/* Disclaimer */}
        <div className="mt-12 py-6 text-center bg-white rounded-2xl shadow-md border border-blue-300">
          <p className="text-base text-blue-700">
            Products shown in the photos may vary. Please verify physically before buying. MRP mentioned on the physical product is final.
          </p>
        </div>
      </div>
    </div>
  );
}
