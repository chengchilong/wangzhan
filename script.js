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

    // 项目数据结构定义
    const projectFolders = [
        ['28号院', 1],
        ['古城', 2],
        ['圆形广场', 3],
        ['翠南', 4],
        ['永东南社区开放办公区', 5],
        ['北京市京源学校', 6],
        ['今日家园', 7],
        ['28·号院长廊', 8],
        ['远洋风景', 9],
        ['万寿路1号院', 10],
        ['永定东里', 11],
        ['老山街道', 12],
        ['翠微西里', 13]
    ].map(([name, order]) => ({
        name,        // 项目名称
        folder: name, // 文件夹名称（与项目名称相同）
        images: ['1.jpg'], // 注意这里改为小写的 jpg
        order        // 项目排序序号
    })).sort((a, b) => a.order - b.order);

    // 创建单个项目卡片的HTML结构
    function createProjectCard(project) {
        const firstImage = project.images[0];
        // 构建OSS图片URL，修改图片扩展名为小写
        const imagePath = `https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/XiangMu/${encodeURIComponent(project.name)}/1.jpg?x-oss-process=image/resize,w_800,m_lfit`;
        
        return `
            <div class="masonry-item" data-folder="${project.folder}">
                <div class="masonry-content">
                    <div class="loading-spinner">
                        <div class="spinner"></div> <!-- 加载动画 -->
                    </div>
                    <img src="${imagePath}" alt="${project.name}" loading="lazy"> <!-- 使用懒加载 -->
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
            masonryGrid.innerHTML = '';
            filteredProjects.forEach(project => {
                masonryGrid.innerHTML += createProjectCard(project);
            });

            // 等待所有图片加载完成
            const images = masonryGrid.querySelectorAll('img');
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
                    img.onerror = () => {
                        console.error('Failed to load image:', img.src);
                        resolve();
                    };
                });
            })).then(() => {
                // 移除加载状态并显示内容
                masonryGrid.classList.remove('loading');
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

    // 配置参数
    const SLIDE_INTERVAL = 2000; // 滑动间隔时间（毫秒）
    const TRANSITION_SPEED = 500; // 过渡动画时间（毫秒）

    // 图片数组（假设图片按照数字顺序命名：1.jpg, 2.jpg, 3.jpg 等）
    let slides = [];
    let currentSlideIndex = 0;
    let slideshowContainer;

    // 初始化函数
    async function initSlideshow() {
        slideshowContainer = document.querySelector('.slideshow-container');
        
        // 获取图片文件列表（这里假设图片在 images 文件夹下）
        try {
            // 动态加载并排序图片
            const imageFiles = await getImageFiles();
            slides = imageFiles.sort((a, b) => {
                // 从文件名中提取数字进行排序
                const numA = parseInt(a.match(/\d+/)[0]);
                const numB = parseInt(b.match(/\d+/)[0]);
                return numA - numB;
            });

            // 创建幻灯片元素
            slides.forEach((imagePath, index) => {
                const slide = document.createElement('div');
                slide.className = 'slide';
                slide.style.transform = `translateY(${index * 100}%)`;
                
                const img = document.createElement('img');
                img.src = imagePath;
                img.alt = `Slide ${index + 1}`;
                
                slide.appendChild(img);
                slideshowContainer.appendChild(slide);
            });

            // 启动自动播放
            setInterval(nextSlide, SLIDE_INTERVAL);
        } catch (error) {
            console.error('初始化幻灯片时出错:', error);
        }
    }

    // 切换到下一张幻灯片
    function nextSlide() {
        const slideElements = document.querySelectorAll('.slide');
        currentSlideIndex = (currentSlideIndex + 1) % slideElements.length;
        
        slideElements.forEach((slide, index) => {
            const offset = index - currentSlideIndex;
            slide.style.transform = `translateY(${offset * 100}%)`;
            slide.style.transition = `transform ${TRANSITION_SPEED}ms ease`;
        });
    }

    // 获取图片文件列表（这个函数需要根据你的实际情况修改）
    async function getImageFiles() {
        // 这里需要根据你的实际情况来实现
        // 例如，如果图片是静态的，你可以直接返回图片路径数组
        return [
            'images/1.jpg',
            'images/2.jpg',
            'images/3.jpg',
            // ... 添加更多图片
        ];
    }

    // 页面加载完成后初始化幻灯片
    document.addEventListener('DOMContentLoaded', initSlideshow);

    // 幻灯片功能对象
    const slideshow = {
        overlay: document.querySelector('.slideshow-overlay'),    // 遮罩层
        container: document.querySelector('.slideshow-container'), // 图片容器
        currentFolder: '',  // 当前显示的项目文件夹
        images: [],        // 当前项目的图片列表

        // 显示幻灯片
        show(folder) {
            this.currentFolder = folder;
            this.images = Array.from({length: 20}, (_, i) => `${folder}/${i + 1}.JPG`);
            this.loadImages();
            this.overlay.style.display = 'block';
            this.overlay.scrollTop = 0;
            requestAnimationFrame(() => {
                this.overlay.style.opacity = '1';
                this.overlay.classList.add('active');
            });
        },

        // 加载幻灯片图片
        loadImages() {
            this.container.innerHTML = '';
            this.images
                .forEach((imagePath, index) => {
                    // 创建幻灯片容器
                    const slide = document.createElement('div');
                    slide.className = 'slide';
                    
                    const newImage = new Image();
                    newImage.alt = `图片 ${index + 1}`;
                    
                    // 图片加载成功后的处理
                    newImage.onload = () => {
                        slide.appendChild(newImage);
                        this.container.appendChild(slide);
                    };
                    
                    // 图片加载失败时的处理
                    newImage.onerror = () => {
                        console.log(`Failed to load image: ${index + 1}`);
                    };
                    
                    // 构建OSS图片URL
                    const projectName = this.currentFolder;
                    const encodedName = encodeURIComponent(projectName);
                    const imageUrl = `https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/XiangMu/${encodedName}/${index + 1}.jpg`;
                    console.log('Loading image:', imageUrl);
                    newImage.src = imageUrl;
                });
        },

        hide() {
            this.overlay.classList.remove('active');
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.style.display = 'none';
                this.container.innerHTML = '';
            }, 500);  // 匹配过渡时间
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

    // 点击图片时显示幻灯片
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.masonry-item');
        if (item) {
            const folder = item.dataset.folder;
            slideshow.show(folder);
        }
    });

    // 添加调试信息
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
        return false;
    };
}); 