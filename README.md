# TextWhisper R2 Upload UI

This project provides a public-facing upload interface for Cloudflare R2 via a Worker endpoint.

## How it works
- Users select a file in their browser
- The file is uploaded directly to: `https://r2-worker.textwhisper.workers.dev/?name=FILENAME`
- The file is stored in the `twaudio` bucket
- Public access is available via: `https://pub-1afc23a510c147a5a857168f23ff6db8.r2.dev/FILENAME`

## Deployment
Hosted on Cloudflare Pages at: [twuploads.pages.dev](https://twuploads.pages.dev)

## Future Enhancements
- Drag-and-drop support
- File type validation
- Upload history or metadata logging
