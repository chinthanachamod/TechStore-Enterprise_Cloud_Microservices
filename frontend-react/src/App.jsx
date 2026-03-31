import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  Image as ImageIcon, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Upload, 
  RefreshCcw, 
  ShieldCheck, 
  Globe, 
  LayoutDashboard, 
  LogOut 
} from 'lucide-react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

// --- Components ---

const StatusBadge = ({ online, label }) => (
  <div className="status-item">
    <div className={`dot ${online ? 'online' : ''}`}></div>
    <span>{label}</span>
  </div>
);

const InternalLink = ({ to, children, onClick }) => (
  <a href="#" onClick={(e) => { e.preventDefault(); onClick(to); }}>{children}</a>
);

const Dashboard = ({ 
  gateway, currentUser, services, activeTab, setActiveTab,
  products, newProduct, setNewProduct, prodMsg,
  searchName, setSearchName, filterCat, setFilterCat,
  files, uploadFile, setUploadFile, mediaMsg,
  handleLogout, handleSaveConfig, loadProducts, handleAddProduct, 
  handleSearch, handleFilter, handleDeleteProduct, loadFiles, handleUpload
}) => (
  <div className="app-container">
    <header className="main-header">
      <div className="logo">
        <LayoutDashboard className="icon-primary" />
        <h1>Tech<span>Store</span></h1>
      </div>
      <div className="header-actions">
        <div className="gateway-info">
          <Globe size={14} />
          <span>{gateway}</span>
        </div>
        {currentUser && (
          <div className="user-profile-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="user-profile">
              <div className="avatar">{currentUser.name[0].toUpperCase()}</div>
              <span>{currentUser.name}</span>
            </div>
            <button className="btn-icon btn-danger" title="Logout" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>

    <div className="status-bar">
      <StatusBadge online={services.users} label="User Service" />
      <StatusBadge online={services.products} label="Product Service" />
      <StatusBadge online={services.media} label="Media Service" />
    </div>

    <nav className="side-nav">
      <button className={activeTab === 'config' ? 'active' : ''} onClick={() => setActiveTab('config')}>
        <Settings size={20} />
        <span>Config</span>
      </button>
      <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
        <Package size={20} />
        <span>Products</span>
      </button>
      <button className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>
        <ImageIcon size={20} />
        <span>Media</span>
      </button>
    </nav>

    <main className="main-content">
      {activeTab === 'config' && (
        <section className="animate-fade-in">
          <div className="section-header">
            <h2><Settings size={22} /> System Configuration</h2>
            <p>Setup your API Gateway endpoint to connect with cloud services.</p>
          </div>
          <div className="glass-card">
            <div className="input-group">
              <label>API Gateway Base URL</label>
              <div className="input-with-icon">
                <Globe className="input-icon" size={18} />
                <input 
                  type="text" 
                  value={gateway} 
                  onChange={(e) => handleSaveConfig(e.target.value, false)} 
                  placeholder="http://localhost:8080"
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => handleSaveConfig(gateway, true)}>
              <RefreshCcw size={18} /> Save & Reconnect
            </button>
          </div>
        </section>
      )}

      {activeTab === 'products' && (
        <section className="animate-fade-in">
          <div className="section-header">
            <h2><Package size={22} /> Catalog Management</h2>
            <p>Add and manage your product inventory synchronized with MongoDB.</p>
          </div>

          <div className="grid-2">
            <div className="glass-card">
              <h3>New Product</h3>
              <form onSubmit={handleAddProduct}>
                <div className="input-group">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                    placeholder="iPhone 15 Pro"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Price (LKR)</label>
                  <input 
                    type="number" 
                    value={newProduct.price} 
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                    placeholder="250000"
                    required
                  />
                </div>
                <div className="grid-2 no-gap">
                  <div className="input-group pr-2">
                    <label>Category</label>
                    <input 
                      type="text" 
                      value={newProduct.category} 
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
                      placeholder="phones"
                      required
                    />
                  </div>
                  <div className="input-group pl-2">
                    <label>Stock</label>
                    <input 
                      type="number" 
                      value={newProduct.stock} 
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} 
                      placeholder="10"
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>Image URL</label>
                  <input 
                    type="text" 
                    value={newProduct.imageUrl} 
                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} 
                    placeholder="https://storage.googleapis.com/..."
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  <Plus size={18} /> Add to Catalog
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3>Search & Filter</h3>
              <div className="input-group">
                <label>Find by Name</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchName} 
                    onChange={(e) => setSearchName(e.target.value)} 
                    placeholder="Search..."
                  />
                  <button className="btn btn-secondary" onClick={handleSearch}><Search size={18} /></button>
                </div>
              </div>
              <div className="input-group">
                <label>Filter by Category</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={filterCat} 
                    onChange={(e) => setFilterCat(e.target.value)} 
                    placeholder="Category..."
                  />
                  <button className="btn btn-secondary" onClick={handleFilter}><Filter size={18} /></button>
                </div>
              </div>
              <hr className="divider" />
              <button className="btn btn-primary w-full" onClick={loadProducts}>
                <RefreshCcw size={18} /> Load All Products
              </button>
            </div>
          </div>

          <div className="product-grid mt-6">
            {products.map(p => (
              <div key={p.id} className="glass-card product-card">
                <div className="product-img">
                  <img src={p.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} alt={p.name} />
                </div>
                <div className="product-info">
                  <h4>{p.name}</h4>
                  <span className="category">{p.category}</span>
                  <span className="price">LKR {parseFloat(p.price).toLocaleString()}</span>
                  <div className="actions">
                    <button className="btn-icon btn-danger" onClick={() => handleDeleteProduct(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'media' && (
        <section className="animate-fade-in">
          <div className="section-header">
            <h2><ImageIcon size={22} /> Media Storage</h2>
            <p>Managed cloud storage with Google Cloud Bucket integration.</p>
          </div>

          <div className="grid-2">
            <div className="glass-card">
              <h3>Upload Assets</h3>
              <div className="upload-zone">
                <input 
                  type="file" 
                  onChange={(e) => setUploadFile(e.target.files[0])} 
                  id="file-upload" 
                  className="hidden"
                />
                <label htmlFor="file-upload" className="upload-label">
                  <Upload size={32} />
                  <span>{uploadFile ? uploadFile.name : 'Select file to upload'}</span>
                </label>
              </div>
              <button 
                className="btn btn-primary w-full mt-4" 
                onClick={handleUpload}
                disabled={!uploadFile}
              >
                <ShieldCheck size={18} /> Secure Upload
              </button>
              {mediaMsg.text && (
                <div className={`alert alert-${mediaMsg.type} mt-4`}>
                  {mediaMsg.text}
                </div>
              )}
            </div>

            <div className="glass-card">
              <h3>Storage Info</h3>
              <ul className="info-list">
                <li><strong>Provider:</strong> Google Cloud Platform</li>
                <li><strong>Bucket:</strong> techstore-media-bucket</li>
                <li><strong>Status:</strong> Connected</li>
              </ul>
              <hr className="divider" />
              <button className="btn btn-primary w-full" onClick={loadFiles}>
                <RefreshCcw size={18} /> Sync with Bucket
              </button>
            </div>
          </div>

          <div className="file-list mt-6">
            {files.map(f => (
              <div key={f.name} className="glass-card file-item">
                <div className="file-icon"><ImageIcon size={20} /></div>
                <div className="file-details">
                  <span className="file-name">{f.name}</span>
                  <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
                <a href={f.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View</a>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  </div>
);

const App = () => {
  const [view, setView] = useState(localStorage.getItem('user') ? 'dashboard' : 'signin');
  const [activeTab, setActiveTab] = useState('config');
  const [gateway, setGateway] = useState(localStorage.getItem('gateway') || 'http://localhost:8080');
  const [services, setServices] = useState({
    users: false,
    products: false,
    media: false
  });

  // Auth State
  const [regData, setRegData] = useState({ name: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [authMsg, setAuthMsg] = useState({ type: '', text: '' });
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Products State
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', category: '', stock: '', imageUrl: ''
  });
  const [searchName, setSearchName] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [prodMsg, setProdMsg] = useState({ type: '', text: '' });

  // Media State
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [mediaMsg, setMediaMsg] = useState({ type: '', text: '' });

  // --- API Helpers ---

  const api = async (path, method = 'GET', body = null, isForm = false) => {
    const url = `${gateway.replace(/\/$/, '')}${path}`;
    const opts = {
      method,
      headers: isForm ? {} : { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = isForm ? body : JSON.stringify(body);
    
    try {
      const res = await fetch(url, opts);
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, data };
    } catch (err) {
      return { ok: false, data: { error: 'Connection failed' } };
    }
  };

  const checkHealth = async () => {
    const check = async (path) => {
      try {
        const res = await fetch(`${gateway.replace(/\/$/, '')}${path}`, { signal: AbortSignal.timeout(3000) });
        return res.ok;
      } catch { return false; }
    };

    const newUsers = await check('/api/users/health');
    const newProducts = await check('/api/products/health');
    const newMedia = await check('/api/media/health');

    // Only update state if something changed to minimize re-renders
    setServices(prev => {
      if (prev.users === newUsers && prev.products === newProducts && prev.media === newMedia) {
        return prev;
      }
      return { users: newUsers, products: newProducts, media: newMedia };
    });
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [gateway]);

  // --- Handlers ---

  const handleSaveConfig = (newGateway, saveToStorage = true) => {
    setGateway(newGateway);
    if (saveToStorage) {
      localStorage.setItem('gateway', newGateway);
      setAuthMsg({ type: 'success', text: 'Gateway configuration saved!' });
      checkHealth();
    }
  };

  const handleRegister = async (data) => {
    setAuthMsg({ type: 'info', text: 'Registering...' });
    const { ok, data: resData } = await api('/api/users/register', 'POST', data);
    if (ok) {
      setAuthMsg({ type: 'success', text: `Registered! You can now sign in.` });
      setView('signin');
    } else {
      setAuthMsg({ type: 'error', text: resData.error || 'Registration failed' });
    }
  };

  const handleLogin = async (data) => {
    setAuthMsg({ type: 'info', text: 'Logging in...' });
    const { ok, data: resData } = await api('/api/users/login', 'POST', data);
    if (ok) {
      setAuthMsg({ type: 'success', text: `Welcome, ${resData.name}!` });
      setCurrentUser(resData);
      localStorage.setItem('user', JSON.stringify(resData));
      setView('dashboard');
    } else {
      setAuthMsg({ type: 'error', text: resData.error || 'Login failed' });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setView('signin');
  };

  const loadProducts = async () => {
    const { ok, data } = await api('/api/products');
    if (ok) setProducts(data);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProdMsg({ type: 'info', text: 'Adding product...' });
    const { ok, data } = await api('/api/products', 'POST', newProduct);
    if (ok) {
      setProdMsg({ type: 'success', text: 'Product added!' });
      setNewProduct({ name: '', description: '', price: '', category: '', stock: '', imageUrl: '' });
      loadProducts();
    } else {
      setProdMsg({ type: 'error', text: data.error || 'Failed to add product' });
    }
  };

  const handleSearch = async () => {
    const { ok, data } = await api(`/api/products/search?name=${searchName}`);
    if (ok) setProducts(data);
  };

  const handleFilter = async () => {
    const { ok, data } = await api(`/api/products/category/${filterCat}`);
    if (ok) setProducts(data);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    const { ok } = await api(`/api/products/${id}`, 'DELETE');
    if (ok) loadProducts();
  };

  const loadFiles = async () => {
    const { ok, data } = await api('/api/media/files');
    if (ok) setFiles(Array.isArray(data) ? data : []);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    setMediaMsg({ type: 'info', text: 'Uploading...' });
    const { ok, data } = await api('/api/media/upload', 'POST', formData, true);
    if (ok) {
      setMediaMsg({ type: 'success', text: 'Upload successful!' });
      setUploadFile(null);
      loadFiles();
    } else {
      setMediaMsg({ type: 'error', text: 'Upload failed' });
    }
  };

  // --- Main Rendering ---
  return (
    <div className="app-root">
      {view === 'signin' && (
        <SignIn onLogin={handleLogin} message={authMsg} onNavigate={setView} />
      )}
      {view === 'signup' && (
        <SignUp onRegister={handleRegister} message={authMsg} onNavigate={setView} />
      )}
      {view === 'dashboard' && (
        <Dashboard 
          gateway={gateway}
          currentUser={currentUser}
          services={services}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          products={products}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          prodMsg={prodMsg}
          searchName={searchName}
          setSearchName={setSearchName}
          filterCat={filterCat}
          setFilterCat={setFilterCat}
          files={files}
          uploadFile={uploadFile}
          setUploadFile={setUploadFile}
          mediaMsg={mediaMsg}
          handleLogout={handleLogout}
          handleSaveConfig={handleSaveConfig}
          loadProducts={loadProducts}
          handleAddProduct={handleAddProduct}
          handleSearch={handleSearch}
          handleFilter={handleFilter}
          handleDeleteProduct={handleDeleteProduct}
          loadFiles={loadFiles}
          handleUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default App;
