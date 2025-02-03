/**
 * 形状类 - 处理单个动态形状的属性和行为
 * 包含位置、大小、颜色、移动和动画等属性
 */
class Shape {
    constructor(x, y, size, color) {
        // 基础属性：位置和大小
        this.x = x;
        this.y = y;
        this.size = size;
        this.originalSize = size;
        this.gradient = color;
        
        // 透明度设置
        this.baseOpacity = 0.1 + Math.random() * 0.15;
        this.opacity = this.baseOpacity;

        // 随机移动速度
        this.movement = {
            x: (Math.random() - 0.5) * 0.2,  // 水平速度范围：-0.1 到 0.1
            y: (Math.random() - 0.5) * 0.15   // 垂直速度范围：-0.075 到 0.075
        };

        // 动画相关属性
        this.breathOffset = Math.random() * Math.PI * 2;  // 随机呼吸周期偏移
        this.rotationSpeed = (Math.random() - 0.5) * 0.015;  // 随机旋转速度
        this.rotation = Math.random() * Math.PI * 2;  // 随机初始角度
    }

    update() {
        // 位置更新
        this.x += this.movement.x;
        this.y += this.movement.y;
        
        // 边界碰撞检测和反弹
        if (this.x < -this.size || this.x > window.innerWidth + this.size) {
            this.movement.x *= -1;
        }
        if (this.y < -this.size || this.y > window.innerHeight + this.size) {
            this.movement.y *= -1;
        }
        
        // 旋转角度更新
        this.rotation += this.rotationSpeed;

        // 呼吸效果：透明度和大小的周期性变化
        const breathTime = Date.now() / 2500;
        this.opacity = this.baseOpacity + Math.sin(breathTime + this.breathOffset) * 0.05;
        const scaleFactor = 1 + Math.sin(breathTime + this.breathOffset) * 0.12;
        this.size = this.originalSize * scaleFactor;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        
        // 创建径向渐变效果
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.gradient[0]);
        gradient.addColorStop(1, this.gradient[1]);
        ctx.fillStyle = gradient;
        
        // 绘制圆形
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * 背景类 - 管理画布和所有形状的渲染
 * 负责初始化、动画循环和窗口大小调整
 */
class Background {
    constructor() {
        // 画布初始化
        this.canvas = document.querySelector('.hero-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.shapes = [];

        // 预定义渐变颜色组合
        this.gradients = [
            ['rgba(128, 255, 219, 0.35)', 'rgba(128, 255, 219, 0)'],  // 浅绿色渐变
            ['rgba(128, 219, 255, 0.35)', 'rgba(128, 219, 255, 0)'],  // 浅蓝色渐变
            ['rgba(255, 128, 219, 0.25)', 'rgba(255, 128, 219, 0)']   // 浅粉色渐变
        ];

        // 初始化和事件绑定
        this.resize();
        this.init();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    // 调整画布大小以适应窗口
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // 初始化形状
    init() {
        const numShapes = 10;  // 形状总数
        for (let i = 0; i < numShapes; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = 200 + Math.random() * 300;  // 随机大小：200-500
            const gradient = this.gradients[Math.floor(Math.random() * this.gradients.length)];
            this.shapes.push(new Shape(x, y, size, gradient));
        }
    }

    // 动画循环
    animate() {
        // 绘制背景渐变
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#000000');
        bgGradient.addColorStop(1, '#111111');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 应用模糊效果并绘制所有形状
        this.ctx.filter = 'blur(90px)';
        this.shapes.forEach(shape => {
            shape.update();
            shape.draw(this.ctx);
        });
        this.ctx.filter = 'none';

        requestAnimationFrame(() => this.animate());
    }
}

// 页面加载完成后初始化背景
document.addEventListener('DOMContentLoaded', () => {
    new Background();
});

// Canvas 背景动画
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.querySelector('.hero-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let lines = [];
    let grid = [];
    
    // 颜色定义
    const colors = {
        background: 'hsl(45, 25%, 95%)', // 仿宣纸暖白色
        ink: 'hsla(0, 0%, 10%, 0.8)',    // 墨黑色
        blue: 'hsla(215, 30%, 35%, 0.6)', // 黛蓝色
        brown: 'hsla(25, 30%, 45%, 0.5)'  // 赭石色
    };

    // 调整画布大小
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initGrid();
    }

    // 水墨粒子类
    class InkParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 2;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.life = 1;
            this.alpha = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX * 0.5;
            this.y += this.speedY * 0.5;
            this.life -= 0.003;
            this.alpha *= 0.995;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(0, 0%, 10%, ${this.alpha})`;
            ctx.fill();
        }
    }

    // 建筑线条类
    class ArchLine {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.length = Math.random() * 100 + 50;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 0.5 + 0.1;
            this.life = 1;
            this.color = Math.random() < 0.5 ? colors.blue : colors.brown;
        }

        update() {
            this.angle += this.speed * 0.02;
            this.life -= 0.005;
            if (this.life <= 0) this.reset();
        }

        draw() {
            const endX = this.x + Math.cos(this.angle) * this.length;
            const endY = this.y + Math.sin(this.angle) * this.length;
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // 初始化透视网格
    function initGrid() {
        grid = [];
        const gridSize = 50;
        const perspectiveOffset = height * 0.3;

        for (let y = -gridSize; y < height + gridSize; y += gridSize) {
            for (let x = -gridSize; x < width + gridSize; x += gridSize) {
                const distanceY = (y - height/2) / (height/2);
                const perspectiveX = x + distanceY * perspectiveOffset;
                grid.push({
                    x: perspectiveX,
                    y: y,
                    originalX: x,
                    originalY: y
                });
            }
        }
    }

    // 绘制网格
    function drawGrid() {
        ctx.strokeStyle = 'hsla(215, 20%, 35%, 0.1)';
        ctx.lineWidth = 0.5;
        
        grid.forEach(point => {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x + 50, point.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x, point.y + 50);
            ctx.stroke();
        });
    }

    // 鼠标交互效果
    let mouseX = 0, mouseY = 0;
    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // 添加水墨粒子
        for (let i = 0; i < 3; i++) {
            particles.push(new InkParticle(mouseX, mouseY));
        }
    });

    // 初始化
    function init() {
        resize();
        // 创建初始线条
        for (let i = 0; i < 20; i++) {
            lines.push(new ArchLine());
        }
        // 创建初始粒子
        for (let i = 0; i < 50; i++) {
            particles.push(new InkParticle(
                Math.random() * width,
                Math.random() * height
            ));
        }
    }

    // 动画循环
    function animate() {
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, width, height);

        // 绘制网格
        drawGrid();

        // 更新和绘制线条
        lines.forEach(line => {
            line.update();
            line.draw();
        });

        // 更新和绘制粒子
        particles = particles.filter(p => p.life > 0);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    // 窗口大小改变时重置画布
    window.addEventListener('resize', resize);

    // 启动动画
    init();
    animate();
}); 