import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { ImagesGrid } from 'polotno/side-panel';
import { getImageSize } from 'polotno/utils/image';
import FaPalette from '@meronex/icons/fa/FaPalette';
import { t } from 'polotno/utils/l10n';

// Free background images and patterns
const FREE_BACKGROUNDS = [
  {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  },
  {
    src: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=800&h=600&fit=crop',
    preview: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=200&h=150&fit=crop',
    credit: 'Unsplash'
  }
];

export const BackgroundsPanel = observer(({ store }) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        Free background images from Unsplash
      </div>
      <ImagesGrid
        images={FREE_BACKGROUNDS}
        getPreview={(image) => image.preview}
        crossOrigin="anonymous"
        onSelect={async (item, pos, element) => {
          const image = item.src;
          let { width, height } = await getImageSize(image);

          // Set as background for the current page
          store.activePage?.set({
            backgroundImage: image,
            backgroundImageWidth: width,
            backgroundImageHeight: height,
          });
        }}
      />
    </div>
  );
});

export const BackgroundsSection = {
  name: 'backgrounds',
  Tab: observer((props) => (
    <SectionTab name={t('sidePanel.background')} {...props}>
      <FaPalette />
    </SectionTab>
  )),
  Panel: BackgroundsPanel,
};
