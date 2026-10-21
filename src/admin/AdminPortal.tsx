import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Camera, 
  Briefcase, 
  FileText, 
  HelpCircle, 
  Image as ImageIcon, 
  Inbox, 
  Settings, 
  Sparkles, 
  Star, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Lock, 
  LogOut, 
  Eye, 
  RotateCcw,
  Copy,
  ChevronRight,
  Filter,
  Film,
  Building2,
  Globe,
  Key,
  ShieldCheck,
  User,
  Save,
  AlertCircle,
  Cloud,
  RefreshCw,
  UploadCloud
} from 'lucide-react';
import { useStoreData, useSettings } from '../hooks/useStore';
import { Store } from '../services/store';
import { 
  Category, 
  Product, 
  GalleryItem, 
  Service, 
  BlogPost, 
  FAQ, 
  Lead,
  Review,
  VideoItem 
} from '../types';
import { ImageDropzone } from '../components/ImageDropzone';
import { MultiImageDropzone } from '../components/MultiImageDropzone';
import { resolveSafeImageUrl } from '../components/SafeImage';
import { checkMediaBucketStatus } from '../services/storage';

interface AdminPortalProps {
  onNavigateHome: () => void;
}

type TabType = 
  | 'dashboard'
  | 'branding'
  | 'hero'
  | 'products'
  | 'categories'
  | 'gallery'
  | 'services'
  | 'videos'
  | 'reviews'
  | 'blog'
  | 'faqs'
  | 'leads'
  | 'business'
  | 'seo'
  | 'media'
  | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateHome }) => {
  const store = useStoreData();
  const [settings, updateSettings] = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Store.isAdminAuthenticated());
  const [emailInput, setEmailInput] = useState<string>(settings.email || 'imranshah1984@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [newHeroVideoInput, setNewHeroVideoInput] = useState('');
  const [bucketStatus, setBucketStatus] = useState<{ checked: boolean; exists: boolean; error?: string }>({ checked: false, exists: false });

  // Dedicated local form states for smooth editing without keystroke network storms
  const [brandingForm, setBrandingForm] = useState({
    brand_name: settings.brand_name || '',
    tagline: settings.tagline || '',
    logo_url: settings.logo_url || '',
    whatsapp: settings.whatsapp || '',
    phone: settings.phone || '',
    address: settings.address || ''
  });
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const [heroForm, setHeroForm] = useState({
    hero_heading: settings.hero_heading || '',
    hero_subheading: settings.hero_subheading || '',
    hero_video_url: settings.hero_video_url || '',
    hero_video_overlay: settings.hero_video_overlay ?? 0.38,
    hero_videos: settings.hero_videos || [],
    hero_images: settings.hero_images || [],
    hero_interval_seconds: settings.hero_interval_seconds ?? 6
  });
  const [isSavingHero, setIsSavingHero] = useState(false);

  const [businessForm, setBusinessForm] = useState({
    brand_name: settings.brand_name || '',
    tagline: settings.tagline || '',
    whatsapp: settings.whatsapp || '',
    phone: settings.phone || '',
    email: settings.email || '',
    opening_hours: settings.opening_hours || '',
    address: settings.address || '',
    google_maps_url: settings.google_maps_url || '',
    instagram_url: settings.instagram_url || '',
    facebook_url: settings.facebook_url || ''
  });
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  const [seoForm, setSeoForm] = useState({
    seo_title: settings.seo_title || '',
    seo_description: settings.seo_description || '',
    seo_keywords: settings.seo_keywords || '',
    footer_description: settings.footer_description || '',
    copyright_text: settings.copyright_text || ''
  });
  const [isSavingSeo, setIsSavingSeo] = useState(false);

  React.useEffect(() => {
    setBrandingForm({
      brand_name: settings.brand_name || '',
      tagline: settings.tagline || '',
      logo_url: settings.logo_url || '',
      whatsapp: settings.whatsapp || '',
      phone: settings.phone || '',
      address: settings.address || ''
    });
    setHeroForm({
      hero_heading: settings.hero_heading || '',
      hero_subheading: settings.hero_subheading || '',
      hero_video_url: settings.hero_video_url || '',
      hero_video_overlay: settings.hero_video_overlay ?? 0.38,
      hero_videos: settings.hero_videos || [],
      hero_images: settings.hero_images || [],
      hero_interval_seconds: settings.hero_interval_seconds ?? 6
    });
    setBusinessForm({
      brand_name: settings.brand_name || '',
      tagline: settings.tagline || '',
      whatsapp: settings.whatsapp || '',
      phone: settings.phone || '',
      email: settings.email || '',
      opening_hours: settings.opening_hours || '',
      address: settings.address || '',
      google_maps_url: settings.google_maps_url || '',
      instagram_url: settings.instagram_url || '',
      facebook_url: settings.facebook_url || ''
    });
    setSeoForm({
      seo_title: settings.seo_title || '',
      seo_description: settings.seo_description || '',
      seo_keywords: settings.seo_keywords || '',
      footer_description: settings.footer_description || '',
      copyright_text: settings.copyright_text || ''
    });
  }, [settings]);

  React.useEffect(() => {
    if (activeTab === 'media' || activeTab === 'settings') {
      checkMediaBucketStatus().then(res => setBucketStatus({ checked: true, exists: res.exists, error: res.error }));
    }
  }, [activeTab]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCloudSync = async () => {
    setIsSyncingCloud(true);
    const res = await Store.manualSyncSupabase();
    setIsSyncingCloud(false);
    showToast(res.message);
  };

  const handleUploadAllToCloud = async () => {
    if (!confirm('Upload all showroom products, categories, and settings to Supabase cloud?')) return;
    setIsSyncingCloud(true);
    const res = await Store.seedAllToSupabase();
    setIsSyncingCloud(false);
    showToast(res.message);
  };

  // --- MODAL STATES ---
  // Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category_id: '',
    main_image: '',
    images: [] as string[],
    material: '',
    dimensions: '',
    finish: '',
    short_description: '',
    description: '',
    customizable: true,
    featured: true
  });

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    image: '',
    is_active: true,
    is_featured: true
  });

  // Gallery Modal
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Living Room',
    image: '',
    description: ''
  });

  // Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    short_description: '',
    description: ''
  });

  // Blog Modal
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'Craftsmanship & Timber',
    read_time: '4 min read'
  });

  // FAQ Modal
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'Custom Orders & Dimensions'
  });

  // Video Modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail: '',
    category: 'Craftsmanship'
  });

  // Account & Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'product' | 'category' | 'gallery' | 'service' | 'blog' | 'faq' | 'media' | 'lead' | 'review' | 'video';
    id: string;
    title: string;
  } | null>(null);

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(false);
    setAuthErrorMessage('');
    const res = await Store.adminLogin(passwordInput, emailInput);
    if (res.success) {
      setIsAuthenticated(true);
      setPasswordInput('');
    } else {
      setAuthError(true);
      setAuthErrorMessage(res.error || 'Invalid credentials. Please verify your password.');
    }
  };

  const handleLogout = async () => {
    await Store.adminLogout();
    setIsAuthenticated(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    const cur = currentPassword.trim();
    const next = newPassword.trim();
    const conf = confirmPassword.trim();

    if (!cur) {
      setPassError('Please enter your current password.');
      return;
    }
    if (!next || next.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (next !== conf) {
      setPassError('New password and confirmation password do not match.');
      return;
    }

    setIsChangingPass(true);
    const res = await Store.updateAdminPassword(cur, next);
    setIsChangingPass(false);

    if (res.success) {
      setPassSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully');
    } else {
      setPassError(res.error || 'Failed to update password');
    }
  };

  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    const res = await Store.updateSettings(brandingForm);
    setIsSavingBranding(false);
    if (res.success) {
      showToast('Branding changes saved to Supabase cloud!', 'success');
    } else {
      showToast(`Cloud sync error: ${res.error}`, 'error');
    }
  };

  const handleSaveHero = async () => {
    setIsSavingHero(true);
    const res = await Store.updateSettings(heroForm);
    setIsSavingHero(false);
    if (res.success) {
      showToast('Homepage visuals & slides saved to Supabase cloud!', 'success');
    } else {
      showToast(`Cloud sync error: ${res.error}`, 'error');
    }
  };

  const handleSaveBusiness = async () => {
    setIsSavingBusiness(true);
    const res = await Store.updateSettings(businessForm);
    setIsSavingBusiness(false);
    if (res.success) {
      showToast('Business information saved to Supabase cloud!', 'success');
    } else {
      showToast(`Cloud sync error: ${res.error}`, 'error');
    }
  };

  const handleSaveSeo = async () => {
    setIsSavingSeo(true);
    const res = await Store.updateSettings(seoForm);
    setIsSavingSeo(false);
    if (res.success) {
      showToast('SEO settings saved to Supabase cloud!', 'success');
    } else {
      showToast(`Cloud sync error: ${res.error}`, 'error');
    }
  };

  // Video Handlers
  const handleOpenNewVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      title: '',
      description: 'Workshop woodworking and joinery walkthrough in Rawalpindi.',
      video_url: '',
      thumbnail: '/images/hero_luxury_living_1791186963111.jpg',
      category: 'Craftsmanship'
    });
    setIsVideoModalOpen(true);
  };

  const handleEditVideo = (v: VideoItem) => {
    setEditingVideo(v);
    setVideoForm({
      title: v.title,
      description: v.description,
      video_url: v.video_url,
      thumbnail: v.thumbnail,
      category: v.category
    });
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title.trim()) return;

    if (editingVideo) {
      const updated: VideoItem = {
        ...editingVideo,
        title: videoForm.title.trim(),
        description: videoForm.description,
        video_url: videoForm.video_url.trim(),
        thumbnail: videoForm.thumbnail || '/images/hero_luxury_living_1791186963111.jpg',
        category: videoForm.category
      };
      Store.saveVideo(updated);
      showToast(`Updated video "${updated.title}"`);
    } else {
      const newVid: VideoItem = {
        id: 'vid-' + Date.now(),
        title: videoForm.title.trim(),
        description: videoForm.description,
        video_url: videoForm.video_url.trim(),
        thumbnail: videoForm.thumbnail || '/images/hero_luxury_living_1791186963111.jpg',
        category: videoForm.category,
        is_featured: true,
        order_index: store.videos.length + 1
      };
      Store.saveVideo(newVid);
      showToast(`Added video "${newVid.title}"`);
    }
    setIsVideoModalOpen(false);
    setEditingVideo(null);
  };

  // --- SAVE HANDLERS ---
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category_id: store.categories[0]?.id || 'living-room',
      main_image: '/images/hero_luxury_living_1791186963111.jpg',
      images: ['/images/hero_luxury_living_1791186963111.jpg'],
      material: 'Solid Seasoned Sheesham Wood (Tahli)',
      dimensions: 'Custom dimensions tailored to your space',
      finish: 'Matte Woodgrain Protective Lacquer',
      short_description: 'Direct manufacturer handcrafted solid wood piece.',
      description: 'Handcrafted at our Shamsabad workshop with seasoned termite-proof hardwood.',
      customizable: true,
      featured: true
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const mainImg = prod.main_image || '/images/hero_luxury_living_1791186963111.jpg';
    const allImgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [mainImg];
    setProdForm({
      name: prod.name,
      category_id: prod.category_id,
      main_image: mainImg,
      images: allImgs,
      material: prod.material || '',
      dimensions: prod.dimensions || '',
      finish: prod.finish || '',
      short_description: prod.short_description || '',
      description: prod.description || '',
      customizable: prod.customizable ?? true,
      featured: prod.featured ?? true
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }

    const catId = prodForm.category_id || store.categories[0]?.id || 'living-room';
    const image = prodForm.main_image || '/images/hero_luxury_living_1791186963111.jpg';
    const allImages = Array.isArray(prodForm.images) && prodForm.images.length > 0 ? [...prodForm.images] : [image];
    if (!allImages.includes(image)) {
      allImages.unshift(image);
    }

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: prodForm.name.trim(),
        category_id: catId,
        main_image: image,
        images: allImages,
        material: prodForm.material || 'Solid Hardwood',
        dimensions: prodForm.dimensions || 'Custom Size',
        finish: prodForm.finish || 'Natural Protective Lacquer',
        short_description: prodForm.short_description,
        description: prodForm.description,
        customizable: prodForm.customizable,
        featured: prodForm.featured,
        price: null,
        price_visible: false,
        quote_only: true
      };
      const res = await Store.saveProduct(updated);
      if (res.success) {
        showToast(`Saved "${updated.name}" to Supabase cloud!`, 'success');
        setIsProductModalOpen(false);
        setEditingProduct(null);
      } else {
        showToast(`Cloud sync error: ${res.error}`, 'error');
      }
    } else {
      const slug = prodForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name: prodForm.name.trim(),
        slug,
        category_id: catId,
        main_image: image,
        images: allImages,
        material: prodForm.material || 'Solid Seasoned Sheesham Wood',
        dimensions: prodForm.dimensions || 'Custom Size Available',
        finish: prodForm.finish || 'Matte Woodgrain Protective Lacquer',
        short_description: prodForm.short_description || 'Direct manufacturer solid wood furniture.',
        description: prodForm.description || 'Handcrafted bespoke piece made at our Shamsabad workshop.',
        availability: 'made_to_order',
        customizable: prodForm.customizable,
        featured: prodForm.featured,
        is_new: true,
        is_bestseller: false,
        tags: ['New Arrival', 'Solid Wood'],
        price: null,
        price_visible: false,
        quote_only: true
      };
      const res = await Store.saveProduct(newProd);
      if (res.success) {
        showToast(`Added product "${newProd.name}" to Supabase cloud!`, 'success');
        setIsProductModalOpen(false);
        setEditingProduct(null);
      } else {
        showToast(`Cloud sync error: ${res.error}`, 'error');
      }
    }
  };

  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCatForm({
      name: '',
      description: 'Bespoke custom crafted collection in seasoned solid wood.',
      image: '/images/cat_living_room_1791186977406.jpg',
      is_active: true,
      is_featured: true
    });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      description: cat.description,
      image: cat.image,
      is_active: cat.is_active,
      is_featured: cat.is_featured
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    if (editingCategory) {
      const updated: Category = {
        ...editingCategory,
        name: catForm.name.trim(),
        description: catForm.description,
        image: catForm.image || editingCategory.image,
        is_active: catForm.is_active,
        is_featured: catForm.is_featured
      };
      const res = await Store.saveCategory(updated);
      if (res.success) {
        showToast(`Updated category "${updated.name}" in Supabase cloud!`, 'success');
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
      } else {
        showToast(`Cloud sync error: ${res.error}`, 'error');
      }
    } else {
      const slug = catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCat: Category = {
        id: slug + '-' + Date.now().toString().slice(-4),
        name: catForm.name.trim(),
        slug,
        description: catForm.description,
        image: catForm.image || '/images/cat_living_room_1791186977406.jpg',
        order_index: store.categories.length + 1,
        is_active: true,
        is_featured: true
      };
      const res = await Store.saveCategory(newCat);
      if (res.success) {
        showToast(`Created category "${newCat.name}" in Supabase cloud!`, 'success');
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
      } else {
        showToast(`Cloud sync error: ${res.error}`, 'error');
      }
    }
  };

  const handleOpenNewGallery = () => {
    setEditingGallery(null);
    setGalleryForm({
      title: '',
      category: 'Living Room',
      image: '/images/hero_luxury_living_1791186963111.jpg',
      description: 'Showroom and residence installation photograph.'
    });
    setIsGalleryModalOpen(true);
  };

  const handleEditGallery = (item: GalleryItem) => {
    setEditingGallery(item);
    setGalleryForm({
      title: item.title,
      category: item.category_name || 'Living Room',
      image: item.image,
      description: item.description
    });
    setIsGalleryModalOpen(true);
  };

  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title.trim()) return;

    if (editingGallery) {
      const updated: GalleryItem = {
        ...editingGallery,
        title: galleryForm.title.trim(),
        category_name: galleryForm.category,
        image: galleryForm.image || editingGallery.image,
        description: galleryForm.description
      };
      Store.saveGalleryItem(updated);
      showToast(`Updated gallery photo "${updated.title}"`);
    } else {
      const newItem: GalleryItem = {
        id: 'gal-' + Date.now(),
        title: galleryForm.title.trim(),
        category_name: galleryForm.category,
        image: galleryForm.image || '/images/hero_luxury_living_1791186963111.jpg',
        description: galleryForm.description,
        featured: true,
        order_index: store.gallery.length + 1,
        is_active: true,
        aspect_ratio: 'wide'
      };
      Store.saveGalleryItem(newItem);
      showToast(`Added space photo "${newItem.title}"`);
    }
    setIsGalleryModalOpen(false);
    setEditingGallery(null);
  };

  const handleOpenNewService = () => {
    setEditingService(null);
    setServiceForm({
      title: '',
      short_description: 'Custom woodworking crafted to your exact specifications.',
      description: 'Direct factory manufacturing with seasoned timber and master artisans.'
    });
    setIsServiceModalOpen(true);
  };

  const handleEditService = (srv: Service) => {
    setEditingService(srv);
    setServiceForm({
      title: srv.title,
      short_description: srv.short_description || '',
      description: srv.description
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) return;

    if (editingService) {
      const updated: Service = {
        ...editingService,
        title: serviceForm.title.trim(),
        short_description: serviceForm.short_description,
        description: serviceForm.description
      };
      Store.saveService(updated);
      showToast(`Updated service "${updated.title}"`);
    } else {
      const newSrv: Service = {
        id: 'srv-' + Date.now(),
        title: serviceForm.title.trim(),
        slug: serviceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        short_description: serviceForm.short_description,
        description: serviceForm.description,
        icon: 'Hammer',
        features: ['Master Artisans', 'Seasoned Wood', 'Direct Factory Price']
      };
      Store.saveService(newSrv);
      showToast(`Added service "${newSrv.title}"`);
    }
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleOpenNewBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      excerpt: 'Learn the essentials of solid wood seasoning and handcrafted furniture.',
      content: 'Wood Care Furniture has perfected the art of timber seasoning in Rawalpindi...',
      featured_image: '/images/cat_dining_1791187001317.jpg',
      category: 'Wood & Craftsmanship',
      read_time: '4 min read'
    });
    setIsBlogModalOpen(true);
  };

  const handleEditBlog = (post: BlogPost) => {
    setEditingBlog(post);
    setBlogForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      featured_image: post.featured_image,
      category: post.category,
      read_time: post.read_time
    });
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim()) return;

    if (editingBlog) {
      const updated: BlogPost = {
        ...editingBlog,
        title: blogForm.title.trim(),
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        featured_image: blogForm.featured_image || editingBlog.featured_image,
        category: blogForm.category,
        read_time: blogForm.read_time
      };
      Store.saveBlogPost(updated);
      showToast(`Updated guide "${updated.title}"`);
    } else {
      const slug = blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newPost: BlogPost = {
        id: 'blog-' + Date.now(),
        title: blogForm.title.trim(),
        slug,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        featured_image: blogForm.featured_image || '/images/cat_dining_1791187001317.jpg',
        category: blogForm.category,
        author: 'Imran Shah',
        published_at: new Date().toISOString().split('T')[0],
        is_published: true,
        read_time: blogForm.read_time
      };
      Store.saveBlogPost(newPost);
      showToast(`Published article "${newPost.title}"`);
    }
    setIsBlogModalOpen(false);
    setEditingBlog(null);
  };

  const handleOpenNewFAQ = () => {
    setEditingFAQ(null);
    setFaqForm({
      question: '',
      answer: 'Yes! We specialize in custom dimensions and bespoke designs. Enquire on WhatsApp for immediate support.',
      category: 'Custom Orders & Sizing'
    });
    setIsFAQModalOpen(true);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'Custom Orders & Sizing'
    });
    setIsFAQModalOpen(true);
  };

  const handleSaveFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim()) return;

    if (editingFAQ) {
      const updated: FAQ = {
        ...editingFAQ,
        question: faqForm.question.trim(),
        answer: faqForm.answer,
        category: faqForm.category
      };
      Store.saveFAQ(updated);
      showToast(`Updated FAQ`);
    } else {
      const newFaq: FAQ = {
        id: 'faq-' + Date.now(),
        question: faqForm.question.trim(),
        answer: faqForm.answer,
        category: faqForm.category,
        order_index: store.faqs.length + 1,
        is_active: true
      };
      Store.saveFAQ(newFaq);
      showToast(`Added new FAQ question`);
    }
    setIsFAQModalOpen(false);
    setEditingFAQ(null);
  };

  // Perform Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;

    if (type === 'product') {
      const res = await Store.deleteProduct(id);
      if (res.success) {
        showToast('Product removed from database', 'success');
      } else {
        showToast(`Product removed locally. Cloud sync: ${res.error}`, 'error');
      }
    } else if (type === 'category') {
      const res = await Store.deleteCategory(id);
      if (res.success) {
        showToast('Category removed from database', 'success');
      } else {
        showToast(`Category removed locally. Cloud sync: ${res.error}`, 'error');
      }
    } else if (type === 'gallery') {
      const res = await Store.deleteGalleryItem(id);
      if (res.success) {
        showToast('Photo removed from Gallery', 'success');
      } else {
        showToast(`Removed locally. Cloud sync: ${res.error}`, 'error');
      }
    } else if (type === 'service') {
      const res = await Store.deleteService(id);
      if (res.success) {
        showToast('Service removed from database', 'success');
      } else {
        showToast(`Removed locally. Cloud sync: ${res.error}`, 'error');
      }
    } else if (type === 'blog') {
      const res = await Store.deleteBlogPost(id);
      if (res.success) {
        showToast('Article removed from database', 'success');
      } else {
        showToast(`Removed locally. Cloud sync: ${res.error}`, 'error');
      }
    } else if (type === 'faq') {
      const res = await Store.deleteFAQ(id);
      if (res.success) {
        showToast('Question removed from database', 'success');
      } else {
        showToast(`Removed locally. Cloud sync: ${res.error}`, 'error');
      }
    } else if (type === 'media') {
      const res = await Store.deleteMedia(id);
      if (res.success) {
        showToast('Media file removed from database', 'success');
      } else {
        showToast(`Removed locally. Cloud sync: ${res.error}`, 'error');
      }
    } else if (type === 'lead') {
      const res = await Store.deleteLead(id);
      if (res.success) {
        showToast('Inquiry removed from database', 'success');
      } else {
        showToast(`Inquiry removed locally. Cloud: ${res.error}`, 'error');
      }
    } else if (type === 'review') {
      const res = await Store.deleteReview(id);
      if (res.success) {
        showToast('Review removed from database', 'success');
      } else {
        showToast(`Removed locally. Cloud sync: ${res.error}`, 'error');
      }
    } else if (type === 'video') {
      Store.deleteVideo(id);
      showToast('Video removed from showroom');
    }
    setDeleteConfirm(null);
  };

  // Reset to sample data
  const handleResetData = () => {
    if (confirm('Reset showroom data to default samples?')) {
      Store.resetToFactoryData();
      showToast('Store reset to clean default data');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#15100D] flex items-center justify-center p-4">
        <div className="bg-[#221812] max-w-md w-full rounded-3xl p-8 sm:p-10 border border-[#443227] shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#2A1D16] border border-[#768A7D]/40 text-[#768A7D] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#FAF6F0]">
              Wood Care Admin Portal
            </h2>
            <p className="text-xs text-stone-300">
              Sign in to manage showroom products, categories, gallery, inquiries & branding.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-200 font-medium mb-1.5">Admin Email</label>
              <input
                type="email"
                placeholder="admin@woodcarefurniture.pk"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full p-3.5 bg-[#17100B] border border-[#443227] rounded-xl focus:outline-none focus:border-[#768A7D] text-sm text-[#FAF6F0]"
              />
            </div>

            <div>
              <label className="block text-stone-200 font-medium mb-1.5">Admin Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                required
                className="w-full p-3.5 bg-[#17100B] border border-[#443227] rounded-xl focus:outline-none focus:border-[#768A7D] text-sm text-[#FAF6F0]"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-300 bg-red-950/50 p-3 rounded-xl border border-red-800">
                {authErrorMessage || 'Invalid credentials. Please verify your password.'}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl transition-colors text-xs sm:text-sm shadow-md"
            >
              Sign In to Management Portal
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="w-full py-2.5 text-stone-400 hover:text-[#FAF6F0] text-xs font-medium text-center block transition-colors"
            >
              ← Return to Showroom Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered products list
  const filteredProducts = store.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.material.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const navigationTabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'branding', label: 'Branding', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'hero', label: 'Homepage', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" />, count: store.products.length },
    { id: 'categories', label: 'Categories', icon: <FolderTree className="w-4 h-4" />, count: store.categories.length },
    { id: 'gallery', label: 'Gallery', icon: <Camera className="w-4 h-4" />, count: store.gallery.length },
    { id: 'services', label: 'Services', icon: <Briefcase className="w-4 h-4" />, count: store.services.length },
    { id: 'videos', label: 'Videos', icon: <Film className="w-4 h-4" />, count: store.videos.length },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" />, count: store.reviews.length },
    { id: 'blog', label: 'Blog', icon: <FileText className="w-4 h-4" />, count: store.blogPosts.length },
    { id: 'faqs', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" />, count: store.faqs.length },
    { id: 'leads', label: 'Leads', icon: <Inbox className="w-4 h-4" />, count: store.leads.filter(l => l.status === 'new').length },
    { id: 'business', label: 'Business Information', icon: <Building2 className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO Settings', icon: <Search className="w-4 h-4" /> },
    { id: 'media', label: 'Media Library', icon: <ImageIcon className="w-4 h-4" />, count: store.media.length },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#15100D] text-[#FAF6F0] flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom duration-200 border ${
          toastType === 'error' 
            ? 'bg-red-900/90 border-red-500 text-red-100' 
            : 'bg-[#768A7D] border-[#8da595] text-white'
        }`}>
          {toastType === 'error' ? <AlertCircle className="w-4 h-4 text-red-300" /> : <Check className="w-4 h-4" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-16 bg-[#221812] border-b border-[#443227] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img 
            src={resolveSafeImageUrl(settings.logo_url) || '/wood_care_logo.svg'} 
            alt="Logo" 
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/wood_care_logo.svg'; }}
            className="w-10 h-10 object-contain rounded-full border border-[#768A7D]/40"
          />
          <div>
            <h1 className="font-serif text-lg font-bold text-[#FAF6F0] leading-none">
              {settings.brand_name || 'Wood Care Furniture'}
            </h1>
            <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-semibold">
              Management Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2A1D16] hover:bg-[#38271E] text-stone-200 transition-colors border border-[#443227]"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 transition-colors border border-red-900/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Responsive Sub-Header for Mobile Tab Selection */}
      <div className="md:hidden bg-[#1E1510] border-b border-[#443227] p-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {navigationTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
              activeTab === tab.id 
                ? 'bg-[#768A7D] text-white font-semibold shadow-xs' 
                : 'text-stone-300 bg-[#2A1D16] hover:bg-[#38271E]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] px-1 py-0.2 bg-black/40 rounded-full font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:flex w-64 bg-[#221812] border-r border-[#443227] p-4 flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1 block">
              Menu Navigation
            </span>
            {navigationTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left ${
                  activeTab === tab.id 
                    ? 'bg-[#768A7D] text-white font-semibold shadow-sm' 
                    : 'hover:bg-[#2A1D16] text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#15100D] text-[#C5A880]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-[#443227] text-[11px] text-stone-400 space-y-2">
            <div>
              <p className="font-semibold text-stone-200">{settings.brand_name}</p>
              <p className="text-[#C5A880]">Shamsabad, Rawalpindi</p>
            </div>
            <button
              onClick={handleResetData}
              className="text-[10px] text-stone-400 hover:text-red-400 flex items-center gap-1 transition-colors pt-2"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-6xl">
          
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                    Showroom Control Center
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Manage the Wood Care Furniture showroom catalog, custom quotes, categories, and photos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCloudSync}
                    disabled={isSyncingCloud}
                    className="px-3.5 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    title="Synchronize latest products with Supabase Cloud"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#C5A880] ${isSyncingCloud ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{isSyncingCloud ? 'Syncing...' : 'Sync Supabase'}</span>
                  </button>

                  <button
                    onClick={handleOpenNewProduct}
                    className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Product</span>
                  </button>
                </div>
              </div>

              {/* Supabase Cloud Live Status Ribbon */}
              <div className="bg-[#1C140F] border border-emerald-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center shrink-0">
                    <Cloud className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#FAF6F0]">Supabase Cloud Database Connected</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                        LIVE & SECURE
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      All changes saved in this admin portal automatically update in the cloud and appear instantly for all public website visitors.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={handleUploadAllToCloud}
                    disabled={isSyncingCloud}
                    className="px-3 py-1.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-300 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Push All Data to Cloud</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveTab('products')}
                  className="bg-[#221812] border border-[#443227] p-5 rounded-2xl cursor-pointer hover:border-[#768A7D] transition-all hover:-translate-y-0.5"
                >
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold">Products</span>
                  <span className="font-serif text-3xl font-bold text-[#FAF6F0] block mt-1">{store.products.length}</span>
                  <span className="text-[11px] text-[#768A7D] flex items-center gap-1 mt-2">Manage products →</span>
                </div>

                <div 
                  onClick={() => setActiveTab('categories')}
                  className="bg-[#221812] border border-[#443227] p-5 rounded-2xl cursor-pointer hover:border-[#768A7D] transition-all hover:-translate-y-0.5"
                >
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold">Categories</span>
                  <span className="font-serif text-3xl font-bold text-[#FAF6F0] block mt-1">{store.categories.length}</span>
                  <span className="text-[11px] text-[#768A7D] flex items-center gap-1 mt-2">Manage categories →</span>
                </div>

                <div 
                  onClick={() => setActiveTab('leads')}
                  className="bg-[#221812] border border-[#443227] p-5 rounded-2xl cursor-pointer hover:border-[#768A7D] transition-all hover:-translate-y-0.5"
                >
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold">New Inquiries</span>
                  <span className="font-serif text-3xl font-bold text-[#C5A880] block mt-1">
                    {store.leads.filter(l => l.status === 'new').length}
                  </span>
                  <span className="text-[11px] text-[#768A7D] flex items-center gap-1 mt-2">Open customer leads →</span>
                </div>

                <div 
                  onClick={() => setActiveTab('reviews')}
                  className="bg-[#221812] border border-[#443227] p-5 rounded-2xl cursor-pointer hover:border-[#768A7D] transition-all hover:-translate-y-0.5"
                >
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-semibold">Client Reviews</span>
                  <span className="font-serif text-3xl font-bold text-[#FAF6F0] block mt-1">{store.reviews.length}</span>
                  <span className="text-[11px] text-[#768A7D] flex items-center gap-1 mt-2">Manage customer reviews →</span>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">
                  Showroom Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleOpenNewProduct}
                    className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Furniture Piece</span>
                  </button>

                  <button
                    onClick={handleOpenNewCategory}
                    className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>

                  <button
                    onClick={handleOpenNewGallery}
                    className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Space Photo</span>
                  </button>

                  <button
                    onClick={handleOpenNewService}
                    className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service</span>
                  </button>

                  <button
                    onClick={handleOpenNewBlog}
                    className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write Guide Article</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                    Products Catalog ({filteredProducts.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Manage furniture items, timber details, drag & drop photos, and custom specs. (All items are inquiry-based).
                  </p>
                </div>

                <button
                  onClick={handleOpenNewProduct}
                  className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search furniture by title or wood material..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-[#221812] border border-[#443227] rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-[#221812] border border-[#443227] rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#768A7D]"
                >
                  <option value="all">All Categories ({store.products.length})</option>
                  {store.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Product List */}
              <div className="bg-[#221812] border border-[#443227] rounded-3xl overflow-hidden divide-y divide-[#443227]">
                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 text-xs space-y-3">
                    <Package className="w-10 h-10 mx-auto text-stone-500 opacity-60" />
                    <p>No products match your search. Click below to add a new piece.</p>
                    <button
                      onClick={handleOpenNewProduct}
                      className="px-4 py-2 bg-[#768A7D] text-white rounded-xl font-semibold"
                    >
                      + Add New Product
                    </button>
                  </div>
                ) : (
                  filteredProducts.map(prod => {
                    const cat = store.categories.find(c => 
                      (prod.category_id && c.id && c.id.toLowerCase() === prod.category_id.toLowerCase()) ||
                      (prod.category_id && c.slug && c.slug.toLowerCase() === prod.category_id.toLowerCase())
                    );
                    return (
                      <div key={prod.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#2A1D16] transition-colors">
                        <div className="flex items-center gap-4">
                          <img 
                            src={resolveSafeImageUrl(prod.main_image)} 
                            alt={prod.name} 
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'; }}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-[#15100D] border border-[#443227] shrink-0" 
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif text-base sm:text-lg font-bold text-[#FAF6F0]">
                                {prod.name}
                              </h4>
                              {prod.featured && (
                                <span className="bg-[#C5A880]/20 text-[#C5A880] px-2 py-0.5 rounded text-[10px] font-semibold border border-[#C5A880]/40">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-400">
                              <strong className="text-stone-300">{cat?.name || 'Furniture'}</strong> · {prod.material}
                            </p>
                            <p className="text-[11px] text-[#768A7D] font-medium">
                              WhatsApp Inquiry Based (No Price Shown)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEditProduct(prod)}
                            className="px-3.5 py-2 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => {
                              setDeleteConfirm({
                                type: 'product',
                                id: prod.id,
                                title: prod.name
                              });
                            }}
                            className="px-3 py-2 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors border border-transparent hover:border-red-900/50"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                    Furniture Categories ({store.categories.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Manage categories displayed in the website header, mega-menu, and catalog filter.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewCategory}
                  className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {store.categories.map(cat => {
                  const linkedProducts = store.products.filter(p => 
                    (p.category_id && cat.id && p.category_id.toLowerCase() === cat.id.toLowerCase()) ||
                    (p.category_id && cat.slug && p.category_id.toLowerCase() === cat.slug.toLowerCase())
                  );
                  const prodCount = linkedProducts.length;
                  const catSubcategories = store.subcategories.filter(s => 
                    (s.category_id && cat.id && s.category_id.toLowerCase() === cat.id.toLowerCase()) ||
                    (s.category_id && cat.slug && s.category_id.toLowerCase() === cat.slug.toLowerCase())
                  );

                  return (
                    <div key={cat.id} className="bg-[#221812] border border-[#443227] rounded-3xl overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="aspect-[16/9] w-full overflow-hidden bg-[#15100D] relative">
                          <img 
                            src={resolveSafeImageUrl(cat.image)} 
                            alt={cat.name} 
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'; }}
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-lg font-mono">
                            /{cat.slug}
                          </span>
                          <span className="absolute top-2 right-2 bg-[#768A7D] text-white text-[10px] px-2 py-0.5 rounded-lg font-bold">
                            {prodCount} {prodCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div className="p-5 space-y-2">
                          <h4 className="font-serif text-lg font-bold text-[#FAF6F0]">{cat.name}</h4>
                          <p className="text-xs text-stone-400 line-clamp-2">{cat.description}</p>
                          
                          {/* Related Subcategories */}
                          {catSubcategories.length > 0 && (
                            <div className="pt-2 border-t border-[#443227]/40">
                              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                                Subcategories:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {catSubcategories.map(s => (
                                  <span key={s.id} className="text-[10px] px-2 py-0.5 bg-[#15100D] border border-[#443227] rounded-md text-stone-300">
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 border-t border-[#443227] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter(cat.id);
                            setActiveTab('products');
                          }}
                          className="px-3 py-1.5 bg-[#15100D] hover:bg-[#2A1D16] border border-[#443227] text-stone-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                          title="View products in this category"
                        >
                          <Package className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Products ({prodCount})</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCategory(cat)}
                            className="px-3 py-1.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirm({
                                type: 'category',
                                id: cat.id,
                                title: cat.name
                              });
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                    Showroom Gallery ({store.gallery.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Finished interior projects, living room spaces, and custom showroom installations in Rawalpindi & Islamabad.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewGallery}
                  className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Photo to Gallery</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {store.gallery.map(item => (
                  <div key={item.id} className="bg-[#221812] border border-[#443227] rounded-3xl overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[#15100D] relative">
                        <img 
                          src={resolveSafeImageUrl(item.image)} 
                          alt={item.title} 
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'; }}
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-2 left-2 bg-[#C5A880] text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {item.category_name || item.category || 'Living Room'}
                        </span>
                        {item.featured && (
                          <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-5 space-y-1.5">
                        <h4 className="font-serif text-lg font-bold text-[#FAF6F0]">{item.title}</h4>
                        <p className="text-xs text-stone-300 line-clamp-2">{item.description}</p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-[#443227] flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditGallery(item)}
                        className="px-3.5 py-1.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            type: 'gallery',
                            id: item.id,
                            title: item.title
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                        title="Delete gallery photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                    Our Services ({store.services.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Manage craftsmanship services offered to residential and wholesale clients.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewService}
                  className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {store.services.map(srv => (
                  <div key={srv.id} className="bg-[#221812] border border-[#443227] rounded-3xl p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-serif text-xl font-bold text-[#FAF6F0]">{srv.title}</h4>
                      <p className="text-xs text-[#C5A880]">{srv.short_description}</p>
                      <p className="text-xs text-stone-300 leading-relaxed">{srv.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#443227] flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditService(srv)}
                        className="px-3.5 py-1.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            type: 'service',
                            id: srv.id,
                            title: srv.title
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BLOG & GUIDES */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                    Blog & Guides ({store.blogPosts.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Manage woodworking guides, timber seasoning articles, and interior care guides.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewBlog}
                  className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write Article</span>
                </button>
              </div>

              <div className="space-y-4">
                {store.blogPosts.map(post => (
                  <div key={post.id} className="bg-[#221812] border border-[#443227] rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={resolveSafeImageUrl(post.featured_image)} 
                        alt={post.title} 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'; }}
                        className="w-20 h-20 rounded-2xl object-cover bg-[#15100D] shrink-0 border border-[#443227]" 
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-semibold">{post.category} · {post.read_time}</span>
                        <h4 className="font-serif text-lg font-bold text-[#FAF6F0]">{post.title}</h4>
                        <p className="text-xs text-stone-400 line-clamp-1">{post.excerpt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditBlog(post)}
                        className="px-3.5 py-1.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            type: 'blog',
                            id: post.id,
                            title: post.title
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                    FAQ Questions ({store.faqs.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Manage common customer questions regarding bespoke manufacturing, delivery, and timber.
                  </p>
                </div>

                <button
                  onClick={handleOpenNewFAQ}
                  className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-3">
                {store.faqs.map(faq => (
                  <div key={faq.id} className="bg-[#221812] border border-[#443227] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-semibold">{faq.category}</span>
                      <h4 className="font-serif text-base font-bold text-[#FAF6F0]">{faq.question}</h4>
                      <p className="text-xs text-stone-300 leading-relaxed">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleEditFAQ(faq)}
                        className="px-3.5 py-1.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            type: 'faq',
                            id: faq.id,
                            title: faq.question
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: MEDIA LIBRARY (DRAG AND DROP FOR IMAGES & VIDEOS) */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                  Media Library ({store.media.length})
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Upload images, videos, or furniture photos directly to Supabase Storage. Click "Copy URL" to use any asset across products, categories, or homepage.
                </p>
              </div>

              {/* Bucket Status Ribbon */}
              {bucketStatus.checked && !bucketStatus.exists && (
                <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-200">Supabase Storage 'media' Bucket Notice</p>
                      <p className="text-stone-300 text-[11px] mt-0.5">
                        Storage bucket <code className="text-amber-300 font-mono">media</code> has not been created yet in project <code className="text-[#C5A880] font-mono">qhqahlykekweryenrnli</code>. Run Section E of <code className="text-[#DFC06A] font-mono">supabase/schema.sql</code> in your Supabase SQL Editor to enable cloud storage. Uploads are currently saved with high-performance local encoding.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-900/60 text-amber-300 rounded-lg font-mono text-[10px] shrink-0 font-bold">
                    PENDING SQL SETUP
                  </span>
                </div>
              )}
              {bucketStatus.checked && bucketStatus.exists && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Supabase Storage Public Bucket <strong className="font-mono text-white">media</strong> is Active</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded-full font-mono text-[10px] font-bold">
                    CONNECTED
                  </span>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8">
                <ImageDropzone
                  value=""
                  onChange={(url) => {
                    if (url) {
                      Store.addMedia('media_upload_' + Date.now().toString().slice(-4), url);
                      showToast('Media uploaded to Library!');
                    }
                  }}
                  label="Upload New Media (Drag & Drop Image or Video)"
                  helperText="Drop image or video file here to automatically optimize and add to Media Library"
                  allowVideo={true}
                />
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {store.media.map(m => (
                  <div key={m.id} className="bg-[#221812] border border-[#443227] rounded-2xl overflow-hidden group">
                    <div className="aspect-square w-full overflow-hidden bg-[#15100D] relative flex items-center justify-center">
                      {m.url.includes('.mp4') || m.url.includes('data:video') ? (
                        <video src={m.url} className="w-full h-full object-cover" />
                      ) : (
                        <img 
                          src={resolveSafeImageUrl(m.url)} 
                          alt={m.name} 
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'; }}
                          className="w-full h-full object-cover" 
                        />
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(m.url);
                              showToast('Copied media URL!');
                            }
                          }}
                          className="p-2 bg-[#2A1D16] text-[#C5A880] rounded-xl hover:bg-[#38271E]"
                          title="Copy media URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              type: 'media',
                              id: m.id,
                              title: m.name
                            });
                          }}
                          className="p-2 bg-red-900/80 text-white rounded-xl hover:bg-red-800"
                          title="Delete media"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] font-semibold text-stone-200 truncate">{m.name}</p>
                      <p className="text-[10px] text-stone-400">{m.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: LEADS & INQUIRIES */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                  Customer Inquiries & Quotes ({store.leads.length})
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Customer quote submissions and direct WhatsApp messages from the showroom website.
                </p>
              </div>

              <div className="space-y-3">
                {store.leads.map(lead => (
                  <div key={lead.id} className="bg-[#221812] border border-[#443227] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-[#FAF6F0]">{lead.name}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          lead.status === 'new' ? 'bg-[#C5A880] text-[#15100D]' : 'bg-[#2A1D16] text-stone-300 border border-[#443227]'
                        }`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300">
                        Phone: <strong className="text-stone-100">{lead.phone}</strong> · Interest: <strong className="text-[#C5A880]">{lead.interest}</strong>
                      </p>
                      <p className="text-xs text-stone-300 italic bg-[#15100D] p-3 rounded-xl border border-[#443227]">
                        "{lead.message}"
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, this is Imran Shah from Wood Care Furniture regarding your custom furniture inquiry.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-black rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        Reply on WhatsApp
                      </a>

                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            type: 'lead',
                            id: lead.id,
                            title: lead.name
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-400 text-xs"
                      >
                        Delete Inquiry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                  Logo & Branding
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Upload or change the Wood Care Furniture logo, brand name, contact numbers, and showroom address.
                </p>
              </div>

              <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
                {/* Live Preview */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Header Brand Lockup Live Preview: [LOGO] + BRAND NAME
                  </label>
                  <div className="p-6 bg-[#15100D] border border-[#443227] rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={resolveSafeImageUrl(brandingForm.logo_url) || '/wood_care_logo.svg'} 
                        alt="Logo" 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/wood_care_logo.svg'; }}
                        className="h-14 w-auto object-contain rounded-full border border-[#768A7D]" 
                      />
                      <div className="flex flex-col">
                        <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#FAF6F0] uppercase leading-none">
                          {brandingForm.brand_name || 'Wood Care Furniture'}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.24em] text-[#C5A880] font-semibold mt-1">
                          Rawalpindi · Islamabad
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drag and Drop Logo Upload */}
                <div className="pt-4 border-t border-[#443227]">
                  <ImageDropzone
                    value={brandingForm.logo_url}
                    onChange={(url) => {
                      setBrandingForm(prev => ({ ...prev, logo_url: url || '/wood_care_logo.svg' }));
                      showToast('Logo updated in form! Click "Save Branding Changes" to persist in cloud.');
                    }}
                    label="Upload / Drag & Drop New Logo"
                    helperText="Drop your brand logo here (PNG, SVG, JPG)"
                  />
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#443227]">
                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={brandingForm.brand_name}
                      onChange={(e) => setBrandingForm({ ...brandingForm, brand_name: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Tagline</label>
                    <input
                      type="text"
                      value={brandingForm.tagline}
                      onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={brandingForm.whatsapp}
                      onChange={(e) => setBrandingForm({ ...brandingForm, whatsapp: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={brandingForm.phone}
                      onChange={(e) => setBrandingForm({ ...brandingForm, phone: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-200 font-medium mb-1">Showroom Address</label>
                  <input
                    type="text"
                    value={brandingForm.address}
                    onChange={(e) => setBrandingForm({ ...brandingForm, address: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>

                {/* Save Branding Button */}
                <div className="pt-4 border-t border-[#443227] flex justify-end">
                  <button
                    type="button"
                    disabled={isSavingBranding}
                    onClick={handleSaveBranding}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#768A7D] hover:bg-[#5C7367] text-white rounded-xl font-semibold shadow-md text-xs sm:text-sm transition-colors disabled:opacity-50"
                  >
                    {isSavingBranding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSavingBranding ? 'Saving...' : 'Save Branding Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: HERO MANAGEMENT (VIDEO & SLIDESHOW) */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                  Hero Video & Visual Management
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Manage the full-bleed background video, adjustable text readability overlay, headline, and slide photos.
                </p>
              </div>

              <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
                {/* 1. HERO BACKGROUND VIDEOS SLIDESHOW (4-5 VIDEOS) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#FAF6F0] flex items-center gap-2">
                        <Film className="w-4 h-4 text-[#C5A880]" />
                        <span>Hero Background Video Slideshow ({settings.hero_videos?.length || 1})</span>
                      </h3>
                      <p className="text-stone-300 text-[11px] mt-0.5">
                        Automatic full-bleed edge-to-edge video slideshow with 4–5 furniture and workshop videos. Add, reorder, delete, and test live.
                      </p>
                    </div>
                  </div>

                  {/* Add New Video to Slideshow */}
                  <div className="bg-[#15100D] p-3.5 rounded-2xl border border-[#443227] space-y-2.5">
                    <label className="block text-stone-200 font-medium text-[11px]">
                      Add Video to Hero Slideshow (Direct MP4, WebM, or YouTube Link)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=... or direct .mp4 URL"
                        value={newHeroVideoInput}
                        onChange={(e) => setNewHeroVideoInput(e.target.value)}
                        className="flex-1 p-2.5 bg-[#221812] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D] font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newHeroVideoInput.trim()) return;
                          const currentVideos = heroForm.hero_videos || [];
                          const updated = [...currentVideos, newHeroVideoInput.trim()];
                          setHeroForm(prev => ({ ...prev, hero_videos: updated, hero_video_url: updated[0] }));
                          setNewHeroVideoInput('');
                          showToast('Video added to form! Click "Save Homepage & Visual Settings" to persist.');
                        }}
                        className="px-4 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Video</span>
                      </button>
                    </div>
                  </div>

                  {/* Current Hero Videos List */}
                  <div className="space-y-2">
                    <label className="block text-stone-300 font-semibold uppercase tracking-wider text-[11px]">
                      Configured Hero Slideshow Videos:
                    </label>
                    <div className="space-y-2">
                      {(heroForm.hero_videos || []).map((vUrl, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between gap-3 p-3 bg-[#15100D] border border-[#443227] rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                            <span className="w-6 h-6 rounded-full bg-[#768A7D]/20 text-[#DFC06A] font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                              {idx + 1}
                            </span>
                            <span className="font-mono text-stone-300 truncate text-[11px]">
                              {vUrl}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(heroForm.hero_videos || [])];
                                  const [moved] = list.splice(idx, 1);
                                  list.splice(idx - 1, 0, moved);
                                  setHeroForm(prev => ({ ...prev, hero_videos: list, hero_video_url: list[0] }));
                                  showToast('Reordered video');
                                }}
                                className="px-2 py-1 bg-[#221812] hover:bg-[#31231A] text-stone-300 rounded text-[10px]"
                                title="Move Up"
                              >
                                ↑
                              </button>
                            )}

                            {idx < (heroForm.hero_videos?.length || 1) - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(heroForm.hero_videos || [])];
                                  const [moved] = list.splice(idx, 1);
                                  list.splice(idx + 1, 0, moved);
                                  setHeroForm(prev => ({ ...prev, hero_videos: list, hero_video_url: list[0] }));
                                  showToast('Reordered video');
                                }}
                                className="px-2 py-1 bg-[#221812] hover:bg-[#31231A] text-stone-300 rounded text-[10px]"
                                title="Move Down"
                              >
                                ↓
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const list = (heroForm.hero_videos || []).filter((_, i) => i !== idx);
                                setHeroForm(prev => ({ 
                                  ...prev, 
                                  hero_videos: list, 
                                  hero_video_url: list[0] || '' 
                                }));
                                showToast('Removed video from list');
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-400 rounded"
                              title="Delete from slideshow"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Select from Store Videos */}
                  {store.videos.length > 0 && (
                    <div className="pt-2">
                      <label className="block text-stone-300 text-[11px] font-medium mb-1.5">
                        Add from showroom videos library:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {store.videos.map((vid) => (
                          <button
                            key={vid.id}
                            type="button"
                            onClick={() => {
                              const currentList = heroForm.hero_videos || [];
                              if (!currentList.includes(vid.video_url)) {
                                const updated = [...currentList, vid.video_url];
                                setHeroForm(prev => ({ ...prev, hero_videos: updated, hero_video_url: updated[0] }));
                                showToast(`Added "${vid.title}" to slideshow`);
                              } else {
                                showToast(`"${vid.title}" is already in slideshow`);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg border text-[11px] transition-colors flex items-center gap-1.5 bg-[#15100D] text-stone-300 border-[#443227] hover:border-[#768A7D]"
                          >
                            <Plus className="w-3 h-3 text-[#DFC06A]" />
                            <span>{vid.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Overlay Darkness Slider */}
                  <div className="pt-2 border-t border-[#443227]/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-stone-200 font-medium">
                        Hero Video Dark Overlay (Text Readability)
                      </label>
                      <span className="font-mono text-[#C5A880]">
                        {Math.round((heroForm.hero_video_overlay ?? 0.38) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.02"
                      value={heroForm.hero_video_overlay ?? 0.38}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, hero_video_overlay: parseFloat(e.target.value) }))}
                      className="w-full accent-[#C5A880] cursor-pointer"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Subtle overlay keeps the video sharp and vibrant while ensuring the Wood Care Furniture logo and text remain crisp and readable.
                    </p>
                  </div>
                </div>

                {/* Add Slide via Dropzone */}
                <div className="pt-4 border-t border-[#443227]">
                  <ImageDropzone
                    value=""
                    onChange={(url) => {
                      if (url) {
                        const current = heroForm.hero_images || [];
                        setHeroForm(prev => ({ ...prev, hero_images: [...current, url] }));
                        showToast('Slide added to form! Click "Save Homepage & Visual Settings" to persist.');
                      }
                    }}
                    label="Add New Slide Image (Drag & Drop)"
                    helperText="Drop furniture photo here to add it as a new background slide"
                  />
                </div>

                {/* Current Slides */}
                <div className="space-y-3 pt-4 border-t border-[#443227]">
                  <label className="block text-stone-300 font-semibold uppercase tracking-wider text-xs">
                    Current Slide Images ({heroForm.hero_images?.length || 0})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(heroForm.hero_images || []).map((img, idx) => (
                      <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-[16/9] bg-[#15100D] border border-[#443227]">
                        <img 
                          src={resolveSafeImageUrl(img)} 
                          alt={`Slide ${idx + 1}`} 
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'; }}
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (heroForm.hero_images || []).filter((_, i) => i !== idx);
                            setHeroForm(prev => ({ ...prev, hero_images: updated }));
                            showToast('Slide removed from list');
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                          Slide #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hero Image Transition Interval (seconds) Setting */}
                <div className="pt-4 border-t border-[#443227] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-stone-200 font-medium text-xs sm:text-sm">
                        Hero Image Transition Interval (seconds)
                      </label>
                      <p className="text-[11px] text-stone-400">
                        How many seconds each hero photo/video remains visible before automatically transitioning to the next slide (default: 6s).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="2"
                        max="30"
                        step="1"
                        value={heroForm.hero_interval_seconds ?? 6}
                        onChange={(e) => {
                          const val = Math.max(2, Math.min(30, parseInt(e.target.value) || 6));
                          setHeroForm(prev => ({ ...prev, hero_interval_seconds: val }));
                        }}
                        className="w-20 p-2 bg-[#15100D] border border-[#443227] rounded-xl text-center font-mono text-sm text-[#DFC06A] focus:outline-none focus:border-[#768A7D]"
                      />
                      <span className="text-xs text-stone-400 font-mono">sec</span>
                    </div>
                  </div>
                </div>

                {/* Headlines */}
                <div className="pt-4 border-t border-[#443227] space-y-4">
                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Hero Heading</label>
                    <input
                      type="text"
                      value={heroForm.hero_heading}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, hero_heading: e.target.value }))}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl font-serif text-base text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Hero Subheading</label>
                    <textarea
                      rows={3}
                      value={heroForm.hero_subheading}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, hero_subheading: e.target.value }))}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>
                </div>

                {/* Save Hero Settings Button */}
                <div className="pt-4 border-t border-[#443227] flex justify-end">
                  <button
                    type="button"
                    disabled={isSavingHero}
                    onClick={handleSaveHero}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#768A7D] hover:bg-[#5C7367] text-white rounded-xl font-semibold shadow-md text-xs sm:text-sm transition-colors disabled:opacity-50"
                  >
                    {isSavingHero ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSavingHero ? 'Saving...' : 'Save Homepage & Visual Settings'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VIDEOS */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                    Showcase & Workshop Videos ({store.videos.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    Manage behind-the-scenes woodworking and furniture showcase video reels.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewVideo}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#768A7D] hover:bg-[#5C7367] text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Video</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.videos.map(vid => (
                  <div key={vid.id} className="bg-[#221812] border border-[#443227] rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between">
                    <div className="relative aspect-video bg-[#15100D] border-b border-[#443227]">
                      <img 
                        src={resolveSafeImageUrl(vid.thumbnail)} 
                        alt={vid.title} 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'; }}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 left-3 bg-[#C5A880] text-black text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                        {vid.category}
                      </div>
                    </div>
                    <div className="p-5 space-y-2 flex-1">
                      <h4 className="font-serif text-xl font-bold text-[#FAF6F0] leading-snug">{vid.title}</h4>
                      <p className="text-xs text-stone-300 line-clamp-2">{vid.description}</p>
                      <span className="text-[11px] text-stone-400 font-mono block truncate mt-2">
                        {vid.video_url}
                      </span>
                    </div>
                    <div className="p-5 pt-0 flex items-center justify-between border-t border-[#443227]/60 mt-2">
                      <button
                        type="button"
                        onClick={() => handleEditVideo(vid)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#C5A880] hover:underline"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ type: 'video', id: vid.id, title: vid.title })}
                        className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BUSINESS INFORMATION */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                  Business & Showroom Information
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Manage contact coordinates, workshop location, opening hours, and direct consultation channels.
                </p>
              </div>

              <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      value={businessForm.brand_name}
                      onChange={(e) => setBusinessForm({ ...businessForm, brand_name: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Tagline</label>
                    <input
                      type="text"
                      value={businessForm.tagline}
                      onChange={(e) => setBusinessForm({ ...businessForm, tagline: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">WhatsApp Consultation Number</label>
                    <input
                      type="text"
                      value={businessForm.whatsapp}
                      onChange={(e) => setBusinessForm({ ...businessForm, whatsapp: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Landline / Direct Phone</label>
                    <input
                      type="text"
                      value={businessForm.phone}
                      onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Admin Email Address</label>
                    <input
                      type="email"
                      value={businessForm.email}
                      onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Opening Hours</label>
                    <input
                      type="text"
                      value={businessForm.opening_hours}
                      onChange={(e) => setBusinessForm({ ...businessForm, opening_hours: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-200 font-medium mb-1">Workshop & Showroom Physical Address</label>
                  <input
                    type="text"
                    value={businessForm.address}
                    onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Google Maps Link</label>
                    <input
                      type="text"
                      value={businessForm.google_maps_url}
                      onChange={(e) => setBusinessForm({ ...businessForm, google_maps_url: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-200 font-medium mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={businessForm.instagram_url}
                      onChange={(e) => setBusinessForm({ ...businessForm, instagram_url: e.target.value })}
                      className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#443227] flex justify-end">
                  <button
                    type="button"
                    disabled={isSavingBusiness}
                    onClick={handleSaveBusiness}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#768A7D] hover:bg-[#5C7367] text-white rounded-xl font-semibold shadow-md text-xs sm:text-sm transition-colors disabled:opacity-50"
                  >
                    {isSavingBusiness ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSavingBusiness ? 'Saving...' : 'Save Business Information'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                  SEO Settings & Local Search Strategy
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Preserve and configure search engine positioning for Rawalpindi, Islamabad and surrounding regions.
                </p>
              </div>

              {/* Status Banner */}
              <div className="p-4 bg-[#2A1D16] border border-[#443227] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-[#FAF6F0] block">Local Search Target Active</span>
                    <span className="text-stone-300">Rawalpindi (Primary) · Islamabad (Secondary) · Pakistan</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-mono">robots.txt: OK</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 font-mono">sitemap.xml: OK</span>
                </div>
              </div>

              <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8 space-y-5 text-xs">
                <div>
                  <label className="block text-stone-200 font-medium mb-1">Global SEO Title</label>
                  <input
                    type="text"
                    value={seoForm.seo_title}
                    onChange={(e) => setSeoForm({ ...seoForm, seo_title: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>

                <div>
                  <label className="block text-stone-200 font-medium mb-1">Global Meta Description</label>
                  <textarea
                    rows={3}
                    value={seoForm.seo_description}
                    onChange={(e) => setSeoForm({ ...seoForm, seo_description: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>

                <div>
                  <label className="block text-stone-200 font-medium mb-1">Target Keyword Mapping</label>
                  <input
                    type="text"
                    value={seoForm.seo_keywords}
                    onChange={(e) => setSeoForm({ ...seoForm, seo_keywords: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-200 focus:outline-none focus:border-[#768A7D]"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    furniture in Rawalpindi, furniture showroom in Rawalpindi, furniture shop in Rawalpindi, furniture in Islamabad, custom sofa, solid sheesham bed
                  </p>
                </div>

                <div className="pt-4 border-t border-[#443227] flex justify-end">
                  <button
                    type="button"
                    disabled={isSavingSeo}
                    onClick={handleSaveSeo}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#768A7D] hover:bg-[#5C7367] text-white rounded-xl font-semibold shadow-md text-xs sm:text-sm transition-colors disabled:opacity-50"
                  >
                    {isSavingSeo ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSavingSeo ? 'Saving...' : 'Save SEO Configuration'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & ACCOUNT MANAGEMENT */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                  Account & System Settings
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Manage authenticated session security, update your password securely, and configure portal options.
                </p>
              </div>

              {/* 1. Current Session Information */}
              {(() => {
                const session = Store.getAdminSession();
                return (
                  <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8 space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#443227]">
                      <div className="flex items-center gap-2.5">
                        <User className="w-5 h-5 text-[#C5A880]" />
                        <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">
                          Current Admin Session
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] font-bold">
                        AUTHENTICATED & ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div className="p-4 bg-[#17100B] border border-[#443227] rounded-2xl">
                        <span className="text-stone-400 text-[11px] block">Admin Email</span>
                        <span className="text-[#FAF6F0] font-semibold text-sm truncate block mt-0.5">
                          {session.email}
                        </span>
                      </div>

                      <div className="p-4 bg-[#17100B] border border-[#443227] rounded-2xl">
                        <span className="text-stone-400 text-[11px] block">Authentication Provider</span>
                        <span className="text-[#C5A880] font-semibold text-sm block mt-0.5">
                          {session.provider}
                        </span>
                      </div>

                      <div className="p-4 bg-[#17100B] border border-[#443227] rounded-2xl">
                        <span className="text-stone-400 text-[11px] block">Session Validity</span>
                        <span className="text-stone-200 font-semibold text-sm block mt-0.5">
                          14-Day Persistent Token
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-stone-400 text-[11px]">
                        Session signed in securely. No passwords stored in plain text.
                      </p>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-900/40 text-red-200 rounded-xl font-semibold transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Change Password Form (Secure Supabase Auth) */}
              <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8 space-y-5 text-xs">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#443227]">
                  <Key className="w-5 h-5 text-[#C5A880]" />
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">
                      Change Password
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Update your administrator credentials securely using Supabase Authentication.
                    </p>
                  </div>
                </div>

                {passSuccess && (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-200 flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                {passError && (
                  <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-200 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-stone-200 font-semibold mb-1">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full p-3.5 bg-[#17100B] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-semibold mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Enter new password (minimum 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3.5 bg-[#17100B] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-200 font-semibold mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3.5 bg-[#17100B] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#768A7D] hover:bg-[#5C7367] disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-colors text-xs"
                    >
                      <Key className="w-4 h-4" />
                      <span>{isChangingPass ? 'Updating Password...' : 'Update Password (Supabase Auth)'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 3. Global System Actions */}
              <div className="bg-[#221812] border border-[#443227] rounded-3xl p-6 sm:p-8 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#443227]">
                  <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">
                    System & Store Data
                  </h3>
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await Store.updateSettings(settings);
                      if (res.success) {
                        showToast('All showroom settings saved to Supabase cloud!', 'success');
                      } else {
                        showToast(`Saved locally only. Cloud sync error: ${res.error}`, 'error');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white rounded-xl font-semibold shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                  <div>
                    <span className="font-semibold text-stone-200 block">Factory Data Reset</span>
                    <span className="text-stone-400 text-[11px]">
                      Restores initial showroom products and categories if testing samples are needed.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2A1D16] hover:bg-amber-950/70 border border-[#443227] text-amber-300 rounded-xl"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Initial Data</span>
                  </button>
                </div>
              </div>

            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF6F0]">
                  Client Reviews ({store.reviews.length})
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  Moderate customer feedback and select reviews to show on the website.
                </p>
              </div>

              <div className="space-y-3">
                {store.reviews.map(rev => (
                  <div key={rev.id} className="bg-[#221812] border border-[#443227] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-base font-bold text-[#FAF6F0]">{rev.author_name}</h4>
                        <span className="text-xs text-stone-400">· {rev.location}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rev.is_approved ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        }`}>
                          {rev.is_approved ? 'PUBLISHED' : 'PENDING'}
                        </span>
                      </div>
                      <div className="text-amber-400 text-xs">{'★'.repeat(rev.rating)}</div>
                      <p className="text-xs text-stone-300 italic">"{rev.review_text}"</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          const res = await Store.updateReview({ ...rev, is_approved: !rev.is_approved });
                          if (res.success) {
                            showToast(rev.is_approved ? 'Unpublished review' : 'Approved review!', 'success');
                          } else {
                            showToast(`Updated locally only: ${res.error}`, 'error');
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
                          rev.is_approved ? 'bg-[#2A1D16] text-stone-300 border border-[#443227]' : 'bg-[#768A7D] text-white'
                        }`}
                      >
                        {rev.is_approved ? 'Unpublish' : 'Approve & Show'}
                      </button>

                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            type: 'review',
                            id: rev.id,
                            title: `Review from ${rev.author_name}`
                          });
                        }}
                        className="p-2 text-stone-400 hover:text-red-400"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ============================================================== */}
      {/* MODALS SECTION (100% RELIABLE DIALOGS - ZERO BROWSER PROMPTS)   */}
      {/* ============================================================== */}

      {/* 1. PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#443227]">
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">
                {editingProduct ? 'Edit Furniture Piece' : 'Add New Furniture Piece'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-200 font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Solid Sheesham Bed Suite"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-200 font-semibold mb-1">Category *</label>
                  <select
                    value={prodForm.category_id}
                    onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                  >
                    {store.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-200 font-semibold mb-1">Material / Wood Species</label>
                  <input
                    type="text"
                    placeholder="e.g. Seasoned Solid Sheesham (Tahli)"
                    value={prodForm.material}
                    onChange={(e) => setProdForm({ ...prodForm, material: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-200 font-semibold mb-1">Dimensions / Size</label>
                  <input
                    type="text"
                    placeholder="e.g. King Size 72 x 78 inches (Customizable)"
                    value={prodForm.dimensions}
                    onChange={(e) => setProdForm({ ...prodForm, dimensions: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>

                <div>
                  <label className="block text-stone-200 font-semibold mb-1">Finish / Polish</label>
                  <input
                    type="text"
                    placeholder="e.g. Matte Walnut Natural Lacquer"
                    value={prodForm.finish}
                    onChange={(e) => setProdForm({ ...prodForm, finish: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>
              </div>

              {/* Drag and Drop Product Photo */}
              <ImageDropzone
                value={prodForm.main_image}
                onChange={(url) => setProdForm({ ...prodForm, main_image: url })}
                label="Product Main Photo (Primary Display)"
                helperText="Drop primary furniture photo here or click to browse (JPG, PNG, WebP)"
                allowVideo={false}
              />

              {/* Multi-Image Gallery Dropzone for Product Detailing */}
              <MultiImageDropzone
                images={prodForm.images || []}
                onChange={(imgs) => setProdForm({ ...prodForm, images: imgs })}
                label="Additional Showcase & Joinery Photos"
                helperText="Upload multiple photos from different angles, joinery details, or fabric swatches"
                maxImages={8}
              />

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Short Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted solid Sheesham wood bed with cantilevered nightstands."
                  value={prodForm.short_description}
                  onChange={(e) => setProdForm({ ...prodForm, short_description: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide craftsmanship details, wood seasoning, foam density, and customization options..."
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={prodForm.featured}
                    onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#768A7D]"
                  />
                  <span>Show in Featured Collection</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={prodForm.customizable}
                    onChange={(e) => setProdForm({ ...prodForm, customizable: e.target.checked })}
                    className="w-4 h-4 rounded text-[#768A7D]"
                  />
                  <span>Customizable on WhatsApp</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#443227]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#443227]">
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-200 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dining Sets"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description for the category..."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <ImageDropzone
                value={catForm.image}
                onChange={(url) => setCatForm({ ...catForm, image: url })}
                label="Category Cover Photo (Drag & Drop)"
                helperText="Drop category photo here"
                allowVideo={false}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#443227]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl shadow-md"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. GALLERY MODAL */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#443227]">
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">
                {editingGallery ? 'Edit Gallery Photo' : 'Add Photo to Spaces Gallery'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-200 font-semibold mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Curved Sofa in Bahria Town Residence"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Space Category</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                >
                  <option value="Living Room">Living Room</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Dining">Dining</option>
                  <option value="Custom Showcase">Custom Showcase</option>
                </select>
              </div>

              <ImageDropzone
                value={galleryForm.image}
                onChange={(url) => setGalleryForm({ ...galleryForm, image: url })}
                label="Space Photo (Drag & Drop)"
                helperText="Drop high-resolution photograph here"
                allowVideo={false}
              />

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Solid Sheesham woodwork with brass trims."
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#443227]">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl shadow-md"
                >
                  {editingGallery ? 'Save Changes' : 'Upload to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#443227]">
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">
                {editingService ? 'Edit Service' : 'Add Service'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-200 font-semibold mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom Architectural Woodworking"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Short Summary</label>
                <input
                  type="text"
                  placeholder="Brief one-line summary..."
                  value={serviceForm.short_description}
                  onChange={(e) => setServiceForm({ ...serviceForm, short_description: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe the service process, craftsmanship guarantees, and delivery..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#443227]">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl shadow-md"
                >
                  {editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. BLOG MODAL */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#443227]">
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">
                {editingBlog ? 'Edit Guide Article' : 'Write New Guide Article'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsBlogModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-200 font-semibold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to Choose Seasoned Sheesham Wood in Rawalpindi"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-200 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Wood Seasoning & Care"
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>
                <div>
                  <label className="block text-stone-200 font-semibold mb-1">Read Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 min read"
                    value={blogForm.read_time}
                    onChange={(e) => setBlogForm({ ...blogForm, read_time: e.target.value })}
                    className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                  />
                </div>
              </div>

              <ImageDropzone
                value={blogForm.featured_image}
                onChange={(url) => setBlogForm({ ...blogForm, featured_image: url })}
                label="Article Header Image (Drag & Drop)"
                helperText="Drop article photograph here"
                allowVideo={false}
              />

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Excerpt (Summary)</label>
                <textarea
                  rows={2}
                  placeholder="Short introductory summary..."
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Article Content</label>
                <textarea
                  rows={6}
                  placeholder="Write the full guide here..."
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#443227]">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl shadow-md"
                >
                  {editingBlog ? 'Save Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. FAQ MODAL */}
      {isFAQModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#443227]">
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">
                {editingFAQ ? 'Edit FAQ' : 'Add FAQ Question'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsFAQModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFAQ} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-200 font-semibold mb-1">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can we customize the dimensions and fabric?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Custom Orders & Dimensions"
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Clear answer for prospective clients..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#443227]">
                <button
                  type="button"
                  onClick={() => setIsFAQModalOpen(false)}
                  className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl shadow-md"
                >
                  {editingFAQ ? 'Save Changes' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#443227]">
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">
                {editingVideo ? 'Edit Video Reel' : 'Add New Showcase Video'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-200 font-semibold mb-1">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Woodworkers Handcrafting Sheesham Table"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Category</label>
                <select
                  value={videoForm.category}
                  onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                >
                  <option value="Craftsmanship">Craftsmanship & Woodworking</option>
                  <option value="Showroom">Showroom Walkthrough</option>
                  <option value="Process">Timber Seasoning & Joinery</option>
                  <option value="Custom">Custom Order Highlights</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Video URL (Embed or Direct Link) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or .mp4 link"
                  value={videoForm.video_url}
                  onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div>
                <ImageDropzone
                  value={videoForm.thumbnail}
                  onChange={(url) => setVideoForm({ ...videoForm, thumbnail: url })}
                  label="Video Thumbnail Image"
                  helperText="Drop thumbnail photo here (JPG, PNG, WebP)"
                />
              </div>

              <div>
                <label className="block text-stone-200 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of what clients see in this video..."
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full p-3 bg-[#15100D] border border-[#443227] rounded-xl text-stone-100 focus:outline-none focus:border-[#768A7D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#443227]">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] text-stone-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold rounded-xl shadow-md"
                >
                  {editingVideo ? 'Save Changes' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221812] border border-[#443227] rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-serif text-xl font-bold text-[#FAF6F0]">
                Delete Item?
              </h4>
              <p className="text-xs text-stone-300">
                Are you sure you want to delete <strong className="text-white font-semibold">"{deleteConfirm.title}"</strong>? This will remove it from the website immediately.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-[#2A1D16] hover:bg-[#38271E] text-stone-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
