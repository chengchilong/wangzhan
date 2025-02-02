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