# Large File Upload Support for All File Types

## Overview

The editor now supports uploading large files (>50MB) for all file types including:
- **Videos** (MP4, WebM, MOV, AVI, etc.)
- **Images** (JPEG, PNG, WebP, BMP, etc.)
- **GIFs** (Animated and static)
- **SVG** files
- **Other file types**

## File Type Detection

The system automatically detects file types using:
1. **MIME type** (primary method)
2. **File extension** (fallback if MIME type is unavailable)

### Supported Image Formats
- JPEG/JPG
- PNG
- GIF (including animated GIFs)
- WebP
- BMP
- ICO
- SVG

### Supported Video Formats
- MP4
- WebM
- OGG
- MOV
- AVI
- MKV

## Large File Handling

### File Size Limits
- **Supabase Free Tier**: 50MB per file
- **Supabase Pro Tier**: Up to 500GB per file

### How It Works

1. **File Size Detection**: Files over 50MB are detected before upload
2. **User Warning**: Warning dialog appears for large files
3. **Upload Attempt**: System attempts direct upload (works for Pro plan users)
4. **Error Handling**: Clear error messages with file-type-specific compression tips

## File-Type-Specific Features

### Videos
- **Detection**: Automatic via MIME type or file extension
- **Preview**: Video thumbnail generated from first frame
- **Compression Tips**: HandBrake, FFmpeg, online compressors
- **Canvas Support**: Full video playback support

### Images (JPEG, PNG, WebP, etc.)
- **Detection**: Automatic via MIME type or file extension
- **Preview**: Thumbnail generated from image
- **Compression Tips**: TinyPNG, ImageOptim, Squoosh, resolution reduction
- **Canvas Support**: Full image display support

### GIFs (Animated and Static)
- **Detection**: Detected as `image/gif` MIME type or `.gif` extension
- **Preview**: First frame shown in thumbnail (animated GIFs maintain animation when added to canvas)
- **Compression Tips**: 
  - Online GIF compressors (ezgif.com, compress-or-die.com)
  - Reduce dimensions/resolution
  - Color palette optimization
  - Convert to MP4 for better compression
- **Canvas Support**: Animated GIFs play correctly when added to design

### SVG Files
- **Detection**: Detected as `image/svg+xml` MIME type or `.svg` extension
- **Preview**: Rendered preview
- **Compression Tips**: SVG optimization tools, remove unnecessary elements
- **Canvas Support**: Full SVG rendering support

## User Experience

### Uploading Large Files

1. **File Selection**: User selects file(s) to upload
2. **Size Check**: System checks file size
3. **Warning Dialog** (if >50MB):
   ```
   ⚠️ Large [file type] detected: XX.XX MB
   
   This [file type] exceeds Supabase's 50MB limit for free tier.
   
   Options:
   - Cancel and compress the [file type] first (recommended)
   - Continue to try upload (may fail if on free tier)
   
   Would you like to continue with the upload?
   ```

4. **Upload Progress**: Progress tracking for files >10MB
5. **Success/Error**: Clear feedback on upload status

### Error Messages

Error messages are **file-type-specific** and provide relevant compression tips:

#### For Videos:
- HandBrake (free): https://handbrake.fr/
- FFmpeg or online video compressors
- Reduce video resolution/quality
- Lower bitrate or frame rate
- Split long videos into shorter segments

#### For GIFs:
- Online GIF compressors (ezgif.com, compress-or-die.com)
- Reduce GIF dimensions/resolution
- Reduce number of colors (color palette optimization)
- Convert to video format (MP4) for better compression
- Split large GIFs into smaller files

#### For Images:
- Image optimization tools (TinyPNG, ImageOptim, Squoosh)
- Reduce image resolution/dimensions
- Convert to more efficient formats (WebP, JPEG with lower quality)
- Remove unnecessary metadata
- Split large images or use image tiles

## Technical Implementation

### File Type Detection
```javascript
function getType(file) {
  const { type, name } = file;
  // Check MIME type first
  if (type) {
    if (type.indexOf('svg') >= 0) return 'svg';
    if (type.indexOf('image') >= 0) return 'image';
    if (type.indexOf('video') >= 0) return 'video';
  }
  // Fallback to file extension
  if (name) {
    const ext = name.toLowerCase().split('.').pop();
    if (ext === 'svg') return 'svg';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  }
  return 'image'; // default
}
```

### Large File Upload Flow
1. File selected → `handleFileInput`
2. File type detected → `getType(file)`
3. Size checked → `file.size > 50 * 1024 * 1024`
4. Warning shown (if large)
5. Preview generated → `getImageFilePreview` or `getVideoPreview`
6. Upload attempted → `uploadAsset` → `writeFile` → `uploadFileInChunks`
7. Error handled (if failed) → File-type-specific error message

### Preview Generation

#### For Images (including GIFs):
- Uses `getImageFilePreview` function
- Creates thumbnail from first frame
- For animated GIFs: Preview shows first frame, but original GIF maintains animation

#### For Videos:
- Uses `getVideoPreview` function
- Creates thumbnail from video frame
- Original video maintains full quality

## GIF-Specific Notes

### Animated GIFs
- **Preview**: Shows first frame only (expected behavior)
- **Upload**: Original animated GIF is uploaded unchanged
- **Canvas**: Animated GIFs play correctly when added to design
- **Storage**: GIFs are stored with `image/gif` MIME type in Supabase

### Static GIFs
- Treated same as other images
- Full support for display and manipulation

### GIF Compression
When GIFs exceed 50MB, users receive specific compression tips:
- Use online GIF compressors
- Reduce dimensions/resolution
- Optimize color palette
- Convert to MP4 (better compression, but loses animation)
- Split into smaller GIFs

## Testing

### Test Cases

1. **Small Files (<50MB)**
   - ✅ Should upload normally
   - ✅ No warning dialog
   - ✅ Works for all file types

2. **Large Files (>50MB)**
   - ✅ Warning dialog appears
   - ✅ Upload attempted
   - ✅ Works on Pro plan
   - ✅ Clear error on Free plan

3. **File Type Detection**
   - ✅ Videos detected correctly
   - ✅ Images detected correctly
   - ✅ GIFs detected correctly
   - ✅ SVG detected correctly
   - ✅ Fallback to extension if MIME type missing

4. **Preview Generation**
   - ✅ Image previews work
   - ✅ GIF previews show first frame
   - ✅ Video previews work
   - ✅ SVG previews work

5. **Canvas Integration**
   - ✅ Images display correctly
   - ✅ Animated GIFs play correctly
   - ✅ Videos play correctly
   - ✅ SVG renders correctly

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Limitations

1. **File Size**: 50MB limit on Supabase free tier
2. **Preview**: Animated GIFs show only first frame in thumbnail
3. **Compression**: Browser-based compression not implemented (users must compress manually)
4. **Progress**: Progress tracking is simulated (not real-time from Supabase)

## Future Improvements

1. **Real Progress Tracking**: Use Supabase progress events when available
2. **Browser Compression**: Implement client-side compression for images
3. **TUS Resumable Uploads**: Implement resumable upload protocol
4. **External Storage**: Support for AWS S3, Cloudflare R2 for large files
5. **Automatic Optimization**: Automatically optimize images before upload

## Support

For issues or questions:
1. Check file size (must be <50MB on free tier)
2. Verify file type is supported
3. Check browser console for detailed error messages
4. Try compressing the file and uploading again

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase File Limits](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [HandBrake Video Compression](https://handbrake.fr/)
- [TinyPNG Image Compression](https://tinypng.com/)
- [EZGIF GIF Tools](https://ezgif.com/)

