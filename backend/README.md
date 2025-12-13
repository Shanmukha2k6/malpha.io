# Video Stream Extraction API

High-performance serverless API for extracting video download links from various platforms using yt-dlp.

## Features

- 🚀 **Serverless Architecture**: Designed for deployment on Vercel, AWS Lambda, or Google Cloud Functions
- 🔒 **Security**: URL sanitization to prevent shell injection attacks
- 🛡️ **Error Handling**: Robust error handling with clean JSON responses
- ⚡ **High Performance**: Async FastAPI with optimized yt-dlp integration
- 🌍 **CORS Enabled**: Ready for public API access

## Tech Stack

- **Framework**: FastAPI
- **Extraction Tool**: yt-dlp (latest version)
- **Python**: 3.9+

## Local Development

### Prerequisites

- Python 3.9 or higher
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### GET /api/extract

Extract video information and download links.

**Parameters:**
- `url` (required): Video URL to extract

**Example:**
```bash
curl "http://localhost:8000/api/extract?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

**Response:**
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

### POST /api/extract

Same as GET endpoint but accepts JSON body.

**Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### AWS Lambda

Use the AWS SAM CLI or Serverless Framework with the provided configuration.

### Google Cloud Functions

```bash
gcloud functions deploy video-extractor \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point handler
```

## Security

- URL sanitization prevents shell injection
- Input validation on all endpoints
- CORS configuration (update for production)
- Rate limiting recommended for production

## Supported Platforms

Thanks to yt-dlp, this API supports:
- YouTube
- Instagram
- TikTok
- Twitter/X
- Facebook
- Vimeo
- And 1000+ more sites

## Error Handling

All errors return a consistent JSON format:
```json
{
  "status": "error",
  "message": "Error description",
  "details": "Additional context"
}
```

## License

MIT
