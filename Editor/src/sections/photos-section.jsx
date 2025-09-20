import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { ImagesGrid } from 'polotno/side-panel';
import { getImageSize } from 'polotno/utils/image';
import FaImages from '@meronex/icons/fa/FaImages';
import { t } from 'polotno/utils/l10n';

// Free stock photos from Unsplash (using their free API)
const FREE_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  }
];

export const PhotosPanel = observer(({ store }) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        Free stock photos from Unsplash
      </div>
      <ImagesGrid
        images={FREE_PHOTOS}
        getPreview={(image) => image.preview}
        crossOrigin="anonymous"
        onSelect={async (item, pos, element) => {
          const image = item.src;
          let { width, height } = await getImageSize(image);

          if (
            element &&
            element.type === 'svg' &&
            element.contentEditable &&
            element.type === 'image'
          ) {
            element.set({ maskSrc: image });
            return;
          }

          if (
            element &&
            element.type === 'image' &&
            element.contentEditable &&
            element.type === 'image'
          ) {
            element.set({ src: image });
            return;
          }

          const scale = Math.min(store.width / width, store.height / height, 1);
          width = width * scale;
          height = height * scale;

          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;

          store.activePage?.addElement({
            type: 'image',
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

export const PhotosSection = {
  name: 'photos',
  Tab: observer((props) => (
    <SectionTab name={t('sidePanel.photos')} {...props}>
      <FaImages />
    </SectionTab>
  )),
  Panel: PhotosPanel,
};
