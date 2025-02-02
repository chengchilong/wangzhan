document.addEventListener('DOMContentLoaded', function() {
    // 点击"查看作品"按钮时滚动到作品展示区
    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('click', function(e) {
        e.preventDefault();
        const worksSection = document.getElementById('works');
        // 使用自定义的平滑滚动
        const startPosition = window.pageYOffset;
        const targetPosition = worksSection.offsetTop;
        const distance = targetPosition - startPosition;
        const duration = 500; // 滚动持续0.5秒
        let start = null;
        
        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // 使用更快的缓动函数
            const easeOutCubic = progress => 1 - Math.pow(1 - progress, 3);
            
            window.scrollTo(0, startPosition + distance * easeOutCubic(progress));
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    });

    // 项目数据
    const projectFolders = [
        ['28号院', 1],
        ['古城', 2],
        ['圆形广场', 3],
        ['翠南', 4],
        ['永东南社区开放办公区', 5],
        ['北京市京源学校', 6],
        ['今日家园', 7],
        ['28号院长廊', 8],
        ['远洋风景', 9]

    ].map(([name, order]) => ({
        name,
        folder: name,  // 只保存项目名称
        images: ['1.JPG'],
        order
    })).sort((a, b) => a.order - b.order);

    // 创建项目卡片的函数
    function createProjectCard(project) {
        const firstImage = project.images[0];
        // 添加图片压缩参数
        const imagePath = `https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/XiangMu/${encodeURIComponent(project.name)}/1.jpg?x-oss-process=image/resize,w_800,m_lfit`;
        
        return `
            <div class="masonry-item" data-folder="${project.folder}">
                <div class="masonry-content">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <img src="${imagePath}" alt="${project.name}" loading="lazy">
                </div>
                <div class="item-info">
                    <h3 class="item-title">${project.name}</h3>
                </div>
            </div>
        `;
    }

    // 加载项目
    const masonryGrid = document.querySelector('.masonry-grid');
    
    // 选项卡切换功能
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 显示加载状态
            masonryGrid.classList.add('loading');
            
            // 获取选中的分类
            const category = this.dataset.category;
            
            // 过滤并显示项目
            const filteredProjects = category === 'all' 
                ? projectFolders 
                : projectFolders.filter(project => project.name === category);
            
            // 清空并重新渲染网格
            masonryGrid.style.opacity = '0';
            masonryGrid.innerHTML = '';
            filteredProjects.forEach(project => {
                masonryGrid.innerHTML += createProjectCard(project);
            });

            // 等待所有图片加载完成
            const images = masonryGrid.querySelectorAll('img');
            Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            })).then(() => {
                // 移除加载状态并显示内容
                masonryGrid.classList.remove('loading');
                masonryGrid.style.opacity = '1';
            });
        });
    });

    // 图片加载完成后处理
    function handleImageLoad(img) {
        img.classList.add('loaded');
        const spinner = img.parentElement.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.opacity = '0';
            setTimeout(() => spinner.remove(), 300);
        }
    }

    // 渲染所有项目
    projectFolders.forEach(project => {
        masonryGrid.innerHTML += createProjectCard(project);
    });

    // 图片加载完成后重新计算布局
    const images = document.querySelectorAll('.masonry-content img');
    Promise.all(Array.from(images).map(img => {
        if (img.complete) {
            handleImageLoad(img);
            return Promise.resolve();
        }
        return new Promise(resolve => {
            img.onload = () => {
                handleImageLoad(img);
                resolve();
            };
            img.addEventListener('load', resolve);
        });
    })).then(() => {
        // 所有图片加载完成
        masonryGrid.classList.remove('loading');
    });

    // 幻灯片功能
    const slideshow = {
        overlay: document.querySelector('.slideshow-overlay'),
        container: document.querySelector('.slideshow-container'),
        currentFolder: '',
        images: [],

        show(folder) {
            this.currentFolder = folder;
            this.images = Array.from({length: 10}, (_, i) => `${folder}/${i + 1}.JPG`);
            this.loadImages();
            this.overlay.style.display = 'block';
            // 使用 RAF 确保过渡动画顺滑
            requestAnimationFrame(() => {
                this.overlay.style.opacity = '1';
                this.overlay.classList.add('active');
            });
        },

        hide() {
            this.overlay.classList.remove('active');
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.style.display = 'none';
                this.container.innerHTML = '';
            }, 500);  // 匹配过渡时间
        },

        loadImages() {
            this.container.innerHTML = '';
            this.images.sort((a, b) => {
                const numA = parseInt(a.match(/(\d+)\.JPG$/)[1]);
                const numB = parseInt(b.match(/(\d+)\.JPG$/)[1]);
                return numA - numB;
            }).forEach((imagePath, index) => {
                const newImage = new Image();
                newImage.className = 'slideshow-image';
                newImage.alt = `图片 ${index + 1}`;
                newImage.onload = () => {
                    this.container.appendChild(newImage);
                    // 添加延迟显示效果
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            newImage.classList.add('visible');
                        }, index * 100);  // 每张图片依次显示
                    });
                };
                newImage.onerror = () => {
                    console.log('图片加载失败:', imagePath);
                };
                const projectName = this.currentFolder;
                const encodedName = encodeURIComponent(projectName);
                newImage.src = `https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/XiangMu/${encodedName}/${index + 1}.jpg`;
            });
        }
    };

    // 点击背景关闭幻灯片
    document.querySelector('.slideshow-overlay').addEventListener('click', (e) => {
        // 只有当点击的是背景时才关闭
        if (e.target === e.currentTarget) {
            slideshow.hide();
        }
    });

    // ESC键关闭幻灯片
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') slideshow.hide();
    });

    // 添加鼠标滚轮事件
    document.querySelector('.slideshow-overlay').addEventListener('wheel', (e) => {
        e.preventDefault();  // 防止页面滚动
        const delta = e.deltaY;
        slideshow.overlay.scrollBy({
            top: delta,
            behavior: 'smooth'
        });
    }, { passive: false });

    // 点击图片时显示幻灯片
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.masonry-item');
        if (item) {
            const folder = item.dataset.folder;
            slideshow.show(folder);
        }
    });
}); 