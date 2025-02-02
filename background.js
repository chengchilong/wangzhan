class Shape {
    constructor(x, y, size, color, speed, type) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.originalSize = size;  // 保存原始大小
        this.gradient = color;  // 现在color是渐变对象
        this.type = type;
        this.baseOpacity = 0.1 + Math.random() * 0.15;  // 基础透明度
        this.opacity = this.baseOpacity;
        this.movement = {
            x: (Math.random() - 0.5) * 0.3,  // 增加水平移动速度
            y: (Math.random() - 0.5) * 0.2   // 增加垂直移动速度
        };
        this.initialY = y;  // 记录初始位置
        this.offset = Math.random() * Math.PI * 2;  // 随机偏移量
        this.breathOffset = Math.random() * Math.PI * 2;  // 呼吸效果的偏移
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;  // 添加旋转
        this.rotation = Math.random() * Math.PI * 2;
    }

    update() {
        // 动态移动
        this.x += this.movement.x;
        this.y += this.movement.y;
        
        // 边界检查和反弹
        if (this.x < -this.size || this.x > window.innerWidth + this.size) {
            this.movement.x *= -1;
        }
        if (this.y < -this.size || this.y > window.innerHeight + this.size) {
            this.movement.y *= -1;
        }
        
        // 旋转
        this.rotation += this.rotationSpeed;

        // 呼吸效果
        const breathTime = Date.now() / 2000;  // 加快呼吸速度
        this.opacity = this.baseOpacity + Math.sin(breathTime + this.breathOffset) * 0.05;
        const scaleFactor = 1 + Math.sin(breathTime + this.breathOffset) * 0.15;  // 增加缩放幅度
        this.size = this.originalSize * scaleFactor;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);  // 添加旋转
        ctx.globalAlpha = this.opacity;
        
        // 创建径向渐变
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.gradient[0]);
        gradient.addColorStop(1, this.gradient[1]);
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Background {
    constructor() {
        this.canvas = document.querySelector('.hero-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.shapes = [];
        this.gradients = [
            ['rgba(255, 69, 58, 0.4)', 'rgba(255, 69, 58, 0)'],     // 鲜艳的红色
            ['rgba(255, 159, 10, 0.4)', 'rgba(255, 159, 10, 0)'],   // 温暖的橙色
            ['rgba(10, 132, 255, 0.4)', 'rgba(10, 132, 255, 0)']    // 明亮的蓝色
        ];
        this.resize();
        this.init();
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        // 减少形状数量，增加大小
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = 300 + Math.random() * 400;  // 更大的形状
            const gradient = this.gradients[Math.floor(Math.random() * this.gradients.length)];
            const type = 'circle';
            
            this.shapes.push(new Shape(x, y, size, gradient, 0, type));
        }
    }

    animate() {
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        bgGradient.addColorStop(0, '#000000');
        bgGradient.addColorStop(1, '#0a0a0a');  // 稍微深一点的背景
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.filter = 'blur(120px)';  // 增加模糊效果
        this.shapes.forEach(shape => {
            shape.update();
            shape.draw(this.ctx);
        });
        this.ctx.filter = 'none';

        requestAnimationFrame(() => this.animate());
    }
}

// 当页面加载完成时初始化背景
document.addEventListener('DOMContentLoaded', () => {
    new Background();
}); 