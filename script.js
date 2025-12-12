// script.js - الملف الرئيسي للتطبيق
document.addEventListener('DOMContentLoaded', async () => {
    // تهيئة Supabase
    const { initializeDatabase, updateStatsDisplay } = window.supabaseConfig;
    const isConnected = await initializeDatabase();
    
    // إعداد متغيرات التطبيق
    window.appData = {
        currentAdminSession: false,
        allItems: { mods: [], versions: [] },
        currentPage: 1,
        itemsPerPage: 12,
        searchTimeout: null
    };
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // إخفاء شاشة التحميل
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        
        if (isConnected) {
            loadInitialData();
        } else {
            loadDemoData();
        }
        
        // تحديث عرض الإحصائيات
        updateStatsDisplay();
        
    }, 1500);
    
    // عرض الصفحة الرئيسية
    showSection('home');
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين الأقسام
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // روابط الفوتر
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // البحث
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(window.appData.searchTimeout);
        window.appData.searchTimeout = setTimeout(performSearch, 500);
    });
    
    // تسجيل دخول الأدمن
    document.getElementById('loginBtn').addEventListener('click', handleAdminLogin);
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
    
    // تسجيل خروج الأدمن
    document.getElementById('logoutBtn').addEventListener('click', handleAdminLogout);
    
    // تحديث البيانات
    document.getElementById('refreshDataBtn')?.addEventListener('click', loadInitialData);
    
    // إغلاق المودال
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('detailsModal').classList.remove('active');
    });
    
    document.getElementById('closePreview').addEventListener('click', () => {
        document.getElementById('previewModal').classList.remove('active');
    });
    
    // زر الإلغاء في النموذج
    document.getElementById('cancelBtn').addEventListener('click', hideForm);
    
    // زر المعاينة
    document.getElementById('previewBtn')?.addEventListener('click', showPreview);
    
    // أحداث الأزرار في لوحة الإدارة
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action === 'add-mod') showForm('mod');
            if (action === 'add-version') showForm('version');
            if (action === 'view-stats') showStatsSection();
        });
    });
    
    // إرسال النموذج
    document.getElementById('modForm').addEventListener('submit', handleFormSubmit);
    
    // بحث في لوحة الإدارة
    document.getElementById('adminSearchMods')?.addEventListener('input', filterAdminItems);
    document.getElementById('adminSearchVersions')?.addEventListener('input', filterAdminItems);
    
    // إغلاق المودال عند النقر خارج المحتوى
    document.getElementById('detailsModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailsModal') {
            document.getElementById('detailsModal').classList.remove('active');
        }
    });
    
    document.getElementById('previewModal').addEventListener('click', (e) => {
        if (e.target.id === 'previewModal') {
            document.getElementById('previewModal').classList.remove('active');
        }
    });
}

// تحميل البيانات الأولية من Supabase
async function loadInitialData() {
    try {
        const { supabase, TABLES, showMessage } = window.supabaseConfig;
        
        // تحميل المودات
        const { data: mods, error: modsError } = await supabase
            .from(TABLES.MODS)
            .select('*')
            .order('created_at', { ascending: false });
        
        if (modsError) throw modsError;
        
        // تحميل الإصدارات
        const { data: versions, error: versionsError } = await supabase
            .from(TABLES.VERSIONS)
            .select('*')
            .order('created_at', { ascending: false });
        
        if (versionsError) throw versionsError;
        
        // حفظ البيانات
        window.appData.allItems.mods = mods || [];
        window.appData.allItems.versions = versions || [];
        
        // تحديث الواجهة
        updateStats();
        renderLatestItems();
        renderAllMods();
        renderAllVersions();
        renderAdminLists();
        
        showMessage('تم تحديث البيانات بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        window.supabaseConfig.showMessage('حدث خطأ في تحميل البيانات', 'error');
        loadDemoData();
    }
}

// تحميل بيانات تجريبية
function loadDemoData() {
    window.appData.allItems.mods = [
        {
            id: 1,
            title: 'مود السيف الحارق',
            description: 'مود رائع يضيف سيوفاً نارية مع تأثيرات خاصة تزيد من متعة اللعبة',
            image_url: 'https://via.placeholder.com/400x200/2d5ba9/ffffff?text=Sword+Mod',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            download_url: 'https://example.com/download/mod1.zip',
            category: 'أسلحة',
            version: '1.20.1',
            downloads: 1500,
            created_at: new Date().toISOString()
        }
    ];
    
    window.appData.allItems.versions = [
        {
            id: 1,
            title: 'ماينكرافت البيدروك 1.20.1',
            description: 'أحدث إصدار مستقر من ماينكرافت البيدروك مع جميع الميزات الجديدة',
            image_url: 'https://via.placeholder.com/400x200/2d5ba9/ffffff?text=Minecraft+1.20.1',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            download_url: 'https://example.com/download/minecraft-1.20.1.apk',
            version: '1.20.1',
            downloads: 15000,
            created_at: new Date().toISOString()
        }
    ];
    
    updateStats();
    renderLatestItems();
    renderAllMods();
    renderAllVersions();
    renderAdminLists();
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('modsCount').textContent = window.appData.allItems.mods.length;
    document.getElementById('versionsCount').textContent = window.appData.allItems.versions.length;
    
    const totalDownloads = [...window.appData.allItems.mods, ...window.appData.allItems.versions]
        .reduce((sum, item) => sum + (item.downloads || 0), 0);
    document.getElementById('totalDownloads').textContent = totalDownloads.toLocaleString();
    
    // تحديث العدادات في لوحة الإدارة
    const modsCountAdmin = document.getElementById('modsCountAdmin');
    const versionsCountAdmin = document.getElementById('versionsCountAdmin');
    
    if (modsCountAdmin) modsCountAdmin.textContent = window.appData.allItems.mods.length;
    if (versionsCountAdmin) versionsCountAdmin.textContent = window.appData.allItems.versions.length;
    
    // تحديث الإحصائيات المتقدمة
    updateAdvancedStats();
}

// تحديث الإحصائيات المتقدمة
function updateAdvancedStats() {
    const topMod = window.appData.allItems.mods.reduce((max, mod) => 
        (mod.downloads || 0) > (max.downloads || 0) ? mod : max, { downloads: 0 });
    
    const topVersion = window.appData.allItems.versions.reduce((max, version) => 
        (version.downloads || 0) > (max.downloads || 0) ? version : max, { downloads: 0 });
    
    const topModEl = document.getElementById('topMod');
    const topVersionEl = document.getElementById('topVersion');
    
    if (topModEl) {
        topModEl.textContent = topMod.title || 'لا توجد بيانات';
    }
    
    if (topVersionEl) {
        topVersionEl.textContent = topVersion.title || 'لا توجد بيانات';
    }
}

// عرض أحدث العناصر
function renderLatestItems() {
    const latestMods = window.appData.allItems.mods.slice(0, 3);
    const latestVersions = window.appData.allItems.versions.slice(0, 3);
    
    renderItems(latestMods, 'latestMods');
    renderItems(latestVersions, 'latestVersions');
}

// عرض جميع المودات
function renderAllMods() {
    renderItems(window.appData.allItems.mods, 'allMods');
    document.getElementById('noModsMessage').style.display = 
        window.appData.allItems.mods.length === 0 ? 'block' : 'none';
}

// عرض جميع الإصدارات
function renderAllVersions() {
    renderItems(window.appData.allItems.versions, 'allVersions');
    document.getElementById('noVersionsMessage').style.display = 
        window.appData.allItems.versions.length === 0 ? 'block' : 'none';
}

// عرض العناصر في الشبكة
function renderItems(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (items.length === 0) {
        container.innerHTML = '<div class="no-results"><p>لا توجد عناصر لعرضها</p></div>';
        return;
    }
    
    items.forEach((item, index) => {
        const isMod = item.category || containerId.includes('mod');
        const typeText = isMod ? 'مود' : 'إصدار';
        const typeClass = isMod ? 'mod-type' : 'version-type';
        
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card';
        itemElement.setAttribute('data-id', item.id);
        itemElement.setAttribute('data-type', isMod ? 'mod' : 'version');
        itemElement.style.animationDelay = `${index * 0.1}s`;
        
        itemElement.innerHTML = `
            <img src="${item.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}" 
                 alt="${item.title}" 
                 onerror="this.src='https://via.placeholder.com/400x200?text=Error+Loading+Image'">
            <div class="item-content">
                <h3 class="item-title">
                    <i class="fas ${isMod ? 'fa-puzzle-piece' : 'fa-download'}"></i>
                    ${item.title}
                </h3>
                <p class="item-desc">${item.description.substring(0, 120)}${item.description.length > 120 ? '...' : ''}</p>
                <div class="item-meta">
                    <span class="item-type ${typeClass}">${typeText}</span>
                    <span>${formatDate(item.created_at)}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary btn-view" data-id="${item.id}" data-type="${isMod ? 'mod' : 'version'}">
                        <i class="fas fa-eye"></i> عرض التفاصيل
                    </button>
                    <button class="btn btn-secondary btn-download" data-url="${item.download_url}">
                        <i class="fas fa-download"></i> تحميل
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(itemElement);
    });
    
    // إضافة مستمعي الأحداث
    attachItemEvents(container);
}

// إرفاق أحداث العناصر
function attachItemEvents(container) {
    container.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const type = btn.getAttribute('data-type');
            showItemDetails(id, type);
        });
    });
    
    container.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = btn.getAttribute('data-url');
            window.open(url, '_blank');
            const itemCard = btn.closest('.item-card');
            const id = itemCard.getAttribute('data-id');
            const type = itemCard.getAttribute('data-type');
            increaseDownloadCount(id, type);
        });
    });
}

// زيادة عداد التحميلات
async function increaseDownloadCount(id, type) {
    try {
        const { supabase, TABLES } = window.supabaseConfig;
        const table = type === 'mod' ? TABLES.MODS : TABLES.VERSIONS;
        
        const { data: item, error: fetchError } = await supabase
            .from(table)
            .select('downloads')
            .eq('id', id)
            .single();
        
        if (fetchError) throw fetchError;
        
        const newDownloads = (item.downloads || 0) + 1;
        
        const { error: updateError } = await supabase
            .from(table)
            .update({ downloads: newDownloads })
            .eq('id', id);
        
        if (updateError) throw updateError;
        
        // تحديث البيانات المحلية
        const itemsArray = type === 'mod' ? window.appData.allItems.mods : window.appData.allItems.versions;
        const itemIndex = itemsArray.findIndex(item => item.id == id);
        if (itemIndex !== -1) {
            itemsArray[itemIndex].downloads = newDownloads;
            updateStats();
            updateAdvancedStats();
        }
        
    } catch (error) {
        console.error('خطأ في زيادة عداد التحميلات:', error);
    }
}

// عرض تفاصيل العنصر
async function showItemDetails(id, type) {
    try {
        const itemsArray = type === 'mod' ? window.appData.allItems.mods : window.appData.allItems.versions;
        let item = itemsArray.find(item => item.id == id);
        
        if (!item) {
            const { supabase, TABLES } = window.supabaseConfig;
            const table = type === 'mod' ? TABLES.MODS : TABLES.VERSIONS;
            
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            item = data;
        }
        
        if (!item) {
            window.supabaseConfig.showMessage('العنصر غير موجود', 'error');
            return;
        }
        
        const modalBody = document.getElementById('modalBody');
        const isMod = type === 'mod';
        
        modalBody.innerHTML = `
            <div class="item-details">
                <div class="detail-header">
                    <h2><i class="fas ${isMod ? 'fa-puzzle-piece' : 'fa-download'}"></i> ${item.title}</h2>
                    <span class="detail-type ${isMod ? 'mod-type' : 'version-type'}">
                        ${isMod ? 'مود' : 'إصدار ماينكرافت'}
                    </span>
                </div>
                
                <div class="detail-image">
                    <img src="${item.image_url}" alt="${item.title}" 
                         onerror="this.src='https://via.placeholder.com/800x400?text=Error+Loading+Image'">
                </div>
                
                <div class="detail-content">
                    <div class="detail-info">
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>تاريخ الإضافة: ${formatDate(item.created_at)}</span>
                        </div>
                        ${item.downloads ? `
                        <div class="info-item">
                            <i class="fas fa-download"></i>
                            <span>عدد التحميلات: ${item.downloads.toLocaleString()}</span>
                        </div>
                        ` : ''}
                        ${item.version ? `
                        <div class="info-item">
                            <i class="fas fa-code-branch"></i>
                            <span>إصدار ماينكرافت: ${item.version}</span>
                        </div>
                        ` : ''}
                        ${item.category ? `
                        <div class="info-item">
                            <i class="fas fa-folder"></i>
                            <span>الفئة: ${item.category}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="detail-description">
                        <h3><i class="fas fa-file-alt"></i> الوصف</h3>
                        <p>${item.description.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    ${item.video_url ? `
                    <div class="detail-video">
                        <h3><i class="fab fa-youtube"></i> فيديو توضيحي</h3>
                        <div class="video-container">
                            <iframe src="https://www.youtube.com/embed/${extractYouTubeId(item.video_url)}" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen></iframe>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="detail-actions">
                        <a href="${item.download_url}" target="_blank" class="btn btn-primary btn-download-modal" 
                           data-id="${item.id}" data-type="${type}">
                            <i class="fas fa-download"></i> تحميل مباشر
                        </a>
                        ${item.video_url ? `
                        <a href="${item.video_url}" target="_blank" class="btn btn-danger">
                            <i class="fab fa-youtube"></i> مشاهدة على يوتيوب
                        </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('detailsModal').classList.add('active');
        
        // إضافة مستمع حدث لزر التحميل في المودال
        modalBody.querySelector('.btn-download-modal')?.addEventListener('click', () => {
            increaseDownloadCount(id, type);
        });
        
    } catch (error) {
        console.error('خطأ في تحميل التفاصيل:', error);
        window.supabaseConfig.showMessage('حدث خطأ في تحميل التفاصيل', 'error');
    }
}

// استخراج معرف فيديو اليوتيوب
function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// البحث
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchTerm) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    const allItemsList = [...window.appData.allItems.mods, ...window.appData.allItems.versions];
    const results = allItemsList.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        item.description.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)) ||
        (item.version && item.version.toLowerCase().includes(searchTerm))
    );
    
    if (results.length > 0) {
        resultsContainer.innerHTML = `
            <h3><i class="fas fa-search"></i> نتائج البحث: ${results.length}</h3>
            <div class="search-items">
                ${results.slice(0, 5).map(item => {
                    const isMod = item.category;
                    return `
                    <div class="search-item" data-id="${item.id}" data-type="${isMod ? 'mod' : 'version'}">
                        <h4>${item.title}</h4>
                        <p>${item.description.substring(0, 80)}...</p>
                        <span class="search-item-type ${isMod ? 'mod-type' : 'version-type'}">
                            ${isMod ? 'مود' : 'إصدار'}
                        </span>
                    </div>
                    `;
                }).join('')}
            </div>
            ${results.length > 5 ? `<p class="search-more">و ${results.length - 5} نتيجة إضافية...</p>` : ''}
        `;
        
        resultsContainer.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                const type = item.getAttribute('data-type');
                showItemDetails(id, type);
                resultsContainer.style.display = 'none';
                document.getElementById('searchInput').value = '';
            });
        });
    } else {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>لا توجد نتائج للبحث "${searchTerm}"</p>
            </div>
        `;
    }
    
    resultsContainer.style.display = 'block';
}

// إدارة تسجيل دخول الأدمن
function handleAdminLogin() {
    const password = document.getElementById('adminPassword').value;
    const messageDiv = document.getElementById('loginMessage');
    
    if (password === window.supabaseConfig.ADMIN_PASSWORD) {
        window.appData.currentAdminSession = true;
        messageDiv.textContent = 'تم تسجيل الدخول بنجاح!';
        messageDiv.className = 'login-message success';
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            showSection('admin-panel');
            messageDiv.style.display = 'none';
            document.getElementById('adminPassword').value = '';
        }, 1000);
    } else {
        messageDiv.textContent = 'كلمة المرور غير صحيحة!';
        messageDiv.className = 'login-message error';
        messageDiv.style.display = 'block';
        
        document.getElementById('adminPassword').style.animation = 'shake 0.5s';
        setTimeout(() => {
            document.getElementById('adminPassword').style.animation = '';
        }, 500);
    }
}

// تسجيل خروج الأدمن
function handleAdminLogout() {
    window.appData.currentAdminSession = false;
    showSection('admin-login');
    window.supabaseConfig.showMessage('تم تسجيل الخروج بنجاح', 'success');
}

// عرض/إخفاء كلمة المرور
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleIcon = document.getElementById('togglePassword');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// عرض القوائم في لوحة الإدارة
function renderAdminLists() {
    renderAdminItems(window.appData.allItems.mods, 'adminModsList', 'mod');
    renderAdminItems(window.appData.allItems.versions, 'adminVersionsList', 'version');
}

// عرض العناصر في لوحة الإدارة
function renderAdminItems(items, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = '<div class="no-results"><p>لا توجد عناصر</p></div>';
        return;
    }
    
    container.innerHTML = items.map(item => `
        <div class="post-item" data-id="${item.id}" data-type="${type}">
            <div class="post-header">
                <h4 class="post-title">${item.title}</h4>
                <span class="item-type ${type === 'mod' ? 'mod-type' : 'version-type'}">
                    ${type === 'mod' ? 'مود' : 'إصدار'}
                </span>
            </div>
            <p>${item.description.substring(0, 80)}...</p>
            <div class="post-meta">
                <small>${formatDate(item.created_at)}</small>
                ${item.downloads ? `<small> | التحميلات: ${item.downloads}</small>` : ''}
                ${item.version ? `<small> | الإصدار: ${item.version}</small>` : ''}
            </div>
            <div class="post-actions">
                <button class="btn btn-primary btn-small btn-edit" data-id="${item.id}" data-type="${type}">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-danger btn-small btn-delete" data-id="${item.id}" data-type="${type}">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        </div>
    `).join('');
    
    // إضافة مستمعي الأحداث
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const type = btn.getAttribute('data-type');
            editItem(id, type);
        });
    });
    
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-id');
            const type = btn.getAttribute('data-type');
            
            if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
                await deleteItem(id, type);
            }
        });
    });
}

// تصفية العناصر في لوحة الإدارة
function filterAdminItems(e) {
    const searchTerm = e.target.value.toLowerCase();
    const containerId = e.target.id.includes('Mods') ? 'adminModsList' : 'adminVersionsList';
    const type = containerId === 'adminModsList' ? 'mod' : 'version';
    const items = type === 'mod' ? window.appData.allItems.mods : window.appData.allItems.versions;
    
    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        (item.category && item.category.toLowerCase().includes(searchTerm)) ||
        (item.version && item.version.toLowerCase().includes(searchTerm))
    );
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (filteredItems.length === 0) {
        container.innerHTML = '<div class="no-results"><p>لا توجد نتائج</p></div>';
        return;
    }
    
    container.innerHTML = filteredItems.map(item => `
        <div class="post-item" data-id="${item.id}" data-type="${type}">
            <div class="post-header">
                <h4 class="post-title">${item.title}</h4>
                <span class="item-type ${type === 'mod' ? 'mod-type' : 'version-type'}">
                    ${type === 'mod' ? 'مود' : 'إصدار'}
                </span>
            </div>
            <p>${item.description.substring(0, 80)}...</p>
            <div class="post-meta">
                <small>${formatDate(item.created_at)}</small>
                ${item.downloads ? `<small> | التحميلات: ${item.downloads}</small>` : ''}
            </div>
            <div class="post-actions">
                <button class="btn btn-primary btn-small btn-edit" data-id="${item.id}" data-type="${type}">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-danger btn-small btn-delete" data-id="${item.id}" data-type="${type}">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        </div>
    `).join('');
    
    // إعادة إرفاق الأحداث
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            const type = btn.getAttribute('data-type');
            editItem(id, type);
        });
    });
    
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-id');
            const type = btn.getAttribute('data-type');
            
            if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
                await deleteItem(id, type);
            }
        });
    });
}

// تعديل عنصر
async function editItem(id, type) {
    try {
        const { supabase, TABLES } = window.supabaseConfig;
        const table = type === 'mod' ? TABLES.MODS : TABLES.VERSIONS;
        
        const { data: item, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        // ملء النموذج
        document.getElementById('editId').value = item.id;
        document.getElementById('itemType').value = type;
        document.getElementById('form-title').textContent = `تعديل ${type === 'mod' ? 'مود' : 'إصدار'}`;
        document.getElementById('title').value = item.title;
        document.getElementById('description').value = item.description;
        document.getElementById('imageUrl').value = item.image_url;
        document.getElementById('videoUrl').value = item.video_url || '';
        document.getElementById('downloadUrl').value = item.download_url;
        
        if (type === 'mod') {
            document.getElementById('category').value = item.category || 'أدوات';
            document.getElementById('version').value = item.version || '';
        } else {
            document.getElementById('version').value = item.version || '';
        }
        
        showForm(type);
        
    } catch (error) {
        console.error('خطأ في تحميل العنصر للتعديل:', error);
        window.supabaseConfig.showMessage('حدث خطأ في تحميل البيانات', 'error');
    }
}

// حذف عنصر
async function deleteItem(id, type) {
    try {
        const { supabase, TABLES } = window.supabaseConfig;
        const table = type === 'mod' ? TABLES.MODS : TABLES.VERSIONS;
        
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        // تحديث البيانات المحلية
        if (type === 'mod') {
            window.appData.allItems.mods = window.appData.allItems.mods.filter(item => item.id != id);
        } else {
            window.appData.allItems.versions = window.appData.allItems.versions.filter(item => item.id != id);
        }
        
        // تحديث الواجهة
        updateStats();
        renderLatestItems();
        renderAllMods();
        renderAllVersions();
        renderAdminLists();
        
        window.supabaseConfig.showMessage('تم حذف العنصر بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في حذف العنصر:', error);
        window.supabaseConfig.showMessage('حدث خطأ في حذف العنصر', 'error');
    }
}

// عرض النموذج
function showForm(type) {
    hideAllAdminSections();
    const formSection = document.getElementById('mod-form-section');
    formSection.style.display = 'block';
    
    if (!document.getElementById('editId').value) {
        document.getElementById('modForm').reset();
        document.getElementById('editId').value = '';
        document.getElementById('itemType').value = type;
        document.getElementById('form-title').textContent = `إضافة ${type === 'mod' ? 'مود جديد' : 'إصدار جديد'}`;
        
        if (type === 'version') {
            document.getElementById('category').value = 'إصدار';
        }
    }
    
    formSection.scrollIntoView({ behavior: 'smooth' });
}

// إخفاء النموذج
function hideForm() {
    document.getElementById('mod-form-section').style.display = 'none';
    document.getElementById('modForm').reset();
    document.getElementById('editId').value = '';
}

// إخفاء جميع أقسام الإدارة
function hideAllAdminSections() {
    document.getElementById('mod-form-section').style.display = 'none';
    document.getElementById('stats-section').style.display = 'none';
}

// عرض قسم الإحصائيات
function showStatsSection() {
    hideAllAdminSections();
    document.getElementById('stats-section').style.display = 'block';
    document.getElementById('stats-section').scrollIntoView({ behavior: 'smooth' });
}

// معاينة العنصر
function showPreview() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const imageUrl = document.getElementById('imageUrl').value;
    const category = document.getElementById('category').value;
    const version = document.getElementById('version').value;
    const type = document.getElementById('itemType').value;
    
    if (!title || !description || !imageUrl) {
        window.supabaseConfig.showMessage('يرجى ملء الحقول المطلوبة أولاً', 'warning');
        return;
    }
    
    const previewBody = document.getElementById('previewBody');
    const isMod = type === 'mod';
    
    previewBody.innerHTML = `
        <div class="preview-item">
            <h2><i class="fas ${isMod ? 'fa-puzzle-piece' : 'fa-download'}"></i> معاينة</h2>
            
            <div class="preview-image">
                <img src="${imageUrl}" alt="${title}" 
                     onerror="this.src='https://via.placeholder.com/400x200?text=Error+Loading+Image'">
            </div>
            
            <div class="preview-content">
                <h3>${title}</h3>
                <p class="preview-category">${isMod ? `الفئة: ${category}` : `الإصدار: ${version}`}</p>
                <div class="preview-description">
                    <h4>الوصف:</h4>
                    <p>${description}</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('previewModal').classList.add('active');
}

// معالجة إرسال النموذج
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const type = document.getElementById('itemType').value;
    const isEdit = !!id;
    
    const itemData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        image_url: document.getElementById('imageUrl').value,
        video_url: document.getElementById('videoUrl').value || null,
        download_url: document.getElementById('downloadUrl').value,
        version: document.getElementById('version').value || null,
        updated_at: new Date().toISOString()
    };
    
    if (type === 'mod') {
        itemData.category = document.getElementById('category').value;
    }
    
    try {
        const { supabase, TABLES } = window.supabaseConfig;
        const table = type === 'mod' ? TABLES.MODS : TABLES.VERSIONS;
        
        let result;
        if (isEdit) {
            result = await supabase
                .from(table)
                .update(itemData)
                .eq('id', id);
        } else {
            itemData.created_at = new Date().toISOString();
            itemData.downloads = 0;
            
            result = await supabase
                .from(table)
                .insert([itemData])
                .select();
        }
        
        if (result.error) throw result.error;
        
        await loadInitialData();
        hideForm();
        window.supabaseConfig.showMessage(`تم ${isEdit ? 'تحديث' : 'إضافة'} العنصر بنجاح`, 'success');
        
    } catch (error) {
        console.error('خطأ في حفظ العنصر:', error);
        window.supabaseConfig.showMessage('حدث خطأ في حفظ العنصر', 'error');
    }
}

// عرض قسم معين
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');
    }
    
    document.getElementById('searchResults').style.display = 'none';
}

// تنسيق التاريخ
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'تاريخ غير معروف';
    }
}

// إضافة أنماط الاهتزاز
const shakeStyles = document.createElement('style');
shakeStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyles);
