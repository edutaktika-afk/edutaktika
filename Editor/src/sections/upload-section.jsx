import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
import { Upload, Trash } from '@blueprintjs/icons';
import {
  ImagesGrid,
  UploadSection as DefaultUploadSection,
} from 'polotno/side-panel';
import { getImageSize, getCrop } from 'polotno/utils/image';
import { getVideoSize, getVideoPreview } from 'polotno/utils/video';
import { dataURLtoBlob } from '../blob';

import { CloudWarning } from '../cloud-warning';

import { useProject } from '../project';
import { listAssets, uploadAsset, deleteAsset } from '../api';

function getType(file) {
  const { type, name } = file;
  // Check MIME type first
  if (type) {
    if (type.indexOf('svg') >= 0) {
      return 'svg';
    }
    if (type.indexOf('image') >= 0) {
      return 'image'; // This includes GIFs, JPEGs, PNGs, WebP, etc.
    }
    if (type.indexOf('video') >= 0) {
      return 'video';
    }
  }
  // Fallback to file extension if MIME type is not available
  if (name) {
    const ext = name.toLowerCase().split('.').pop();
    if (ext === 'svg') return 'svg';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  }
  // Default to image
  return 'image';
}

const getImageFilePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target.result;
      // now we need to render that image into smaller canvas and get data url
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = (200 * img.height) / img.width;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
};

export const UploadPanel = observer(({ store }) => {
  const [images, setImages] = React.useState([]);
  const [isUploading, setUploading] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const project = useProject();

  const load = async () => {
    setLoading(true);
    const images = await listAssets();
    setImages(images);
    setLoading(false);
  };

  const handleFileInput = async (e) => {
    const { target } = e;
    setUploading(true);
    
    try {
      for (const file of target.files) {
        const type = getType(file);
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        
        // Inform user if file is large (compression will happen automatically)
        if (file.size > 50 * 1024 * 1024) {
          // Determine file type for better messaging
          const isVideo = type === 'video';
          const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
          const isImage = type === 'image' && !isGif;
          
          let fileTypeLabel = 'file';
          if (isVideo) fileTypeLabel = 'video';
          else if (isGif) fileTypeLabel = 'GIF';
          else if (isImage) fileTypeLabel = 'image';
          
          // Inform user that automatic compression will happen
          const shouldContinue = window.confirm(
            `⚠️ Large ${fileTypeLabel} detected: ${fileSizeMB}MB\n\n` +
            `This ${fileTypeLabel} exceeds Supabase's 50MB limit.\n\n` +
            `The file will be automatically compressed to fit within the limit.\n` +
            `Quality may be reduced, but the ${fileTypeLabel} will remain visible.\n\n` +
            `Would you like to continue?`
          );
          
          if (!shouldContinue) {
            continue; // Skip this file
          }
        }
        
        try {
          let previewDataURL = '';
          // Generate preview based on file type
          if (type === 'video') {
            previewDataURL = await getVideoPreview(URL.createObjectURL(file));
          } else if (type === 'image' || type === 'svg') {
            // Handle images (including GIFs, JPEGs, PNGs, etc.)
            previewDataURL = await getImageFilePreview(file);
          } else {
            // Fallback for unknown types - try to generate image preview
            previewDataURL = await getImageFilePreview(file);
          }
          const preview = dataURLtoBlob(previewDataURL);
          
          // Show progress for large files (compression + upload)
          const onProgress = file.size > 10 * 1024 * 1024 ? (progress) => {
            console.log(`Upload progress: ${progress}%`);
            // You could update a progress bar UI here if needed
          } : null;
          
          await uploadAsset({ file, preview, type, onProgress });
          console.log(`✅ Successfully uploaded: ${file.name} (${fileSizeMB}MB)`);
        } catch (error) {
          console.error(`❌ Upload failed for ${file.name}:`, error);
          
          // Show user-friendly error message
          if (error.name === 'FileTooLargeError' || error.message.includes('too large') || error.message.includes('50MB')) {
            alert(
              `❌ Upload Failed: ${file.name}\n\n` +
              error.message +
              `\n\nThe file was not uploaded. Please compress it and try again.`
            );
          } else {
            alert(
              `❌ Upload Failed: ${file.name}\n\n` +
              `Error: ${error.message}\n\n` +
              `Please try again or contact support if the problem persists.`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      alert(`Upload error: ${error.message}`);
    } finally {
      await load();
      setUploading(false);
      target.value = null;
    }
  };

  const handleDelete = async (image) => {
    if (window.confirm('Are you sure you want to delete the image?')) {
      setImages(images.filter((i) => i.id !== image.id));
      await deleteAsset({ id: image.id });
      await load();
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  React.useEffect(() => {
    load();
  }, [project.cloudEnabled]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="input-file">
          <Button
            icon={<Upload />}
            style={{ width: '100%' }}
            onClick={() => {
              document.querySelector('#input-file')?.click();
            }}
            loading={isUploading}
            intent="primary"
          >
            Upload
          </Button>
          <input
            type="file"
            id="input-file"
            style={{ display: 'none' }}
            onChange={handleFileInput}
            multiple
            accept="image/*,video/*"
          />
        </label>
      </div>
      <CloudWarning />
      <ImagesGrid
        images={images}
        getPreview={(image) => image.preview}
        crossOrigin={undefined}
        isLoading={isLoading}
        getCredit={(image) => (
          <div>
            <Button
              icon={<Trash />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(image);
              }}
            ></Button>
          </div>
        )}
        onSelect={async (item, pos, element) => {
          const image = item.src;
          const type = item.type;

          const getSizeFunc = type === 'video' ? getVideoSize : getImageSize;

          let { width, height } = await getSizeFunc(image);

          if (
            element &&
            element.type === 'svg' &&
            element.contentEditable &&
            type === 'image'
          ) {
            element.set({ maskSrc: image });
            return;
          }

          if (
            element &&
            element.type === 'image' &&
            element.contentEditable &&
            type == 'image'
          ) {
            const crop = getCrop(element, {
              width,
              height,
            });
            element.set({ src: image, ...crop });
            return;
          }

          const scale = Math.min(store.width / width, store.height / height, 1);
          width = width * scale;
          height = height * scale;

          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;

          store.activePage?.addElement({
            type,
            src: image,
            x,
            y,
            width,
            height,
          });
        }}
      />
    </div>
  );
});

DefaultUploadSection.Panel = UploadPanel;

export const UploadSection = DefaultUploadSection;
