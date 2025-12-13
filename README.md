# Malpha.io - Video Stream Extraction Service

A high-performance, serverless video download service with a modern web interface. Extract and download videos from YouTube, Instagram, TikTok, and 1000+ platforms.

## 🚀 Features

### Backend
- ⚡ **FastAPI**: High-performance async Python framework
- 🔧 **yt-dlp Integration**: Latest video extraction technology
- 🛡️ **Security**: URL sanitization and input validation
- 🌐 **Serverless Ready**: Deploy to Vercel, AWS Lambda, or Google Cloud Functions
- 📊 **Structured Responses**: Clean JSON API with error handling
- 🔒 **CORS Enabled**: Public API access with configurable origins

### Frontend
- 🎨 **Premium Design**: Modern dark theme with glassmorphism
- ⚡ **Lightning Fast**: Vanilla JavaScript, no framework overhead
- 📱 **Fully Responsive**: Works on all devices
- 💰 **Monetization Ready**: Pre-configured ad slots
- ✨ **Smooth Animations**: Micro-interactions throughout
- 🎯 **SEO Optimized**: Meta tags and semantic HTML

## 📁 Project Structure

```
malpha-io/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── vercel.json         # Vercel deployment config
│   ├── .env.example        # Environment variables template
│   └── README.md           # Backend documentation
│
├── frontend/
│   ├── index.html          # Main HTML
│   ├── styles.css          # Complete styling
│   ├── app.js              # Application logic
│   └── README.md           # Frontend documentation
│
└── README.md               # This file
```

## 🛠️ Tech Stack

**Backend:**
- Python 3.9+
- FastAPI
- yt-dlp
- Uvicorn

**Frontend:**
- HTML5
- CSS3 (Modern features: Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Google Fonts (Inter)

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run development server:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Update API endpoint in `app.js`:**
```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    API_ENDPOINT: '/api/extract',
};
```

3. **Start a local server:**

**Option A - Python:**
```bash
python -m http.server 8080
```

**Option B - Node.js:**
```bash
npx http-server -p 8080
```

**Option C - VS Code Live Server:**
- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"

Frontend will be available at `http://localhost:8080`

## 📡 API Usage

### Extract Video Information

**Endpoint:** `GET /api/extract`

**Parameters:**
- `url` (required): Video URL to extract

**Example Request:**
```bash
curl "http://localhost:8000/api/extract?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

**Success Response:**
```json
{
  "status": "success",
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 213,
  "uploader": "Channel Name",
  "formats": [
    {
      "quality": "1080p",
      "ext": "mp4",
      "width": 1920,
      "height": 1080,
      "filesize": 52428800,
      "filesize_mb": 50.0,
      "url": "https://...",
      "format_id": "137"
    }
  ]
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Extraction failed",
  "details": "Unable to extract video information"
}
```

## 🌐 Deployment

### Backend Deployment

#### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd backend
vercel
```

#### AWS Lambda

Use AWS SAM or Serverless Framework with the provided handler.

#### Google Cloud Functions

```bash
gcloud functions deploy video-extractor \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point handler
```

### Frontend Deployment

#### Vercel

```bash
cd frontend
vercel
```

#### Netlify

Drag and drop the `frontend` folder to [Netlify Drop](https://app.netlify.com/drop)

#### GitHub Pages

1. Push to GitHub
2. Settings → Pages
3. Select branch and folder
4. Deploy

## 💰 Monetization

The frontend includes pre-configured ad slots:

1. **Leaderboard Ad** (728x90) - Top of page
2. **Skyscraper Ad** (300x600) - Sidebar (desktop only)

Replace placeholder content in `index.html` with your ad network code:
- Google AdSense
- Media.net
- PropellerAds
- etc.

## 🔒 Security Features

- ✅ URL sanitization to prevent shell injection
- ✅ Input validation on all endpoints
- ✅ CORS configuration
- ✅ Error handling without exposing internals
- ✅ Rate limiting (recommended for production)

## 🎯 Supported Platforms

Thanks to yt-dlp, this service supports:
- YouTube
- Instagram
- TikTok
- Twitter/X
- Facebook
- Vimeo
- Dailymotion
- Reddit
- And 1000+ more sites

[See full list](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## 🐛 Troubleshooting

### Backend Issues

**Issue:** `ModuleNotFoundError: No module named 'yt_dlp'`
```bash
pip install -r requirements.txt
```

**Issue:** CORS errors
- Update `allow_origins` in `main.py` to include your frontend URL

### Frontend Issues

**Issue:** "Network Error" when extracting
- Ensure backend is running
- Check `API_BASE_URL` in `app.js`
- Verify CORS settings

**Issue:** Downloads not working
- Some platforms require authentication
- Video may be private or deleted
- Check browser console for errors

## 📈 Performance Optimization

### Backend
- Use serverless functions for auto-scaling
- Implement caching for repeated requests
- Add rate limiting to prevent abuse

### Frontend
- Minify CSS/JS for production
- Use CDN for static assets
- Enable browser caching
- Optimize images

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The powerful extraction engine
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Inter Font](https://rsms.me/inter/) - Beautiful typography

## 📞 Support

For issues and questions:
1. Check the documentation in `/backend/README.md` and `/frontend/README.md`
2. Review the troubleshooting section above
3. Open an issue on GitHub

---

**Built with ❤️ for the community**
