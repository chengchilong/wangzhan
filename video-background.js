class VideoBackground {
    constructor() {
        this.videoElement = document.getElementById('bgVideo');
        this.videoUrls = [
            'https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/img/video/bg1.mp4',
            'https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/img/video/bg2.mp4',
            'https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/img/video/bg3.mp4',
            'https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/img/video/bg4.mp4',
            'https://chengchilong.oss-cn-wuhan-lr.aliyuncs.com/img/video/bg5.mp4'
        ];
        this.currentVideoIndex = 0;
        this.init();
    }

    init() {
        // 设置视频属性
        this.videoElement.muted = true;
        this.videoElement.autoplay = true;
        this.videoElement.playsinline = true;
        this.videoElement.preload = 'auto';

        // 监听视频结束事件
        this.videoElement.addEventListener('ended', () => {
            this.playNextVideo();
        });

        // 错误处理
        this.videoElement.addEventListener('error', (e) => {
            console.error('Video error:', e);
            this.playNextVideo();
        });

        // 开始播放第一个视频
        this.loadCurrentVideo();

        // 添加调试信息
        this.videoElement.addEventListener('loadstart', () => console.log('Video loadstart'));
        this.videoElement.addEventListener('loadeddata', () => console.log('Video loadeddata'));
        this.videoElement.addEventListener('playing', () => console.log('Video playing'));
    }

    loadCurrentVideo() {
        // 淡出当前视频
        this.videoElement.style.opacity = '0';
        
        setTimeout(() => {
            // 设置新的视频源
            this.videoElement.src = this.videoUrls[this.currentVideoIndex];
            
            // 加载并播放
            this.videoElement.load();
            this.videoElement.play().then(() => {
                // 播放成功后淡入
                this.videoElement.style.opacity = '1';
            }).catch(error => {
                console.log("Video play was prevented:", error);
                this.playNextVideo();
            });
        }, 500); // 等待淡出动画完成
    }

    playNextVideo() {
        // 更新视频索引，循环播放
        this.currentVideoIndex = (this.currentVideoIndex + 1) % this.videoUrls.length;
        this.loadCurrentVideo();
    }

    // 预加载下一个视频
    preloadNextVideo() {
        const nextIndex = (this.currentVideoIndex + 1) % this.videoUrls.length;
        const nextVideo = new Image();
        nextVideo.src = this.videoUrls[nextIndex];
    }
}

// 页面加载完成后初始化视频背景
document.addEventListener('DOMContentLoaded', () => {
    new VideoBackground();
});