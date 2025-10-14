import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
  EditableText,
  Popover,
  Icon,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import FaGithub from '@meronex/icons/fa/FaGithub';
import FaDiscord from '@meronex/icons/fa/FaDiscord';
import FaTwitter from '@meronex/icons/fa/FaTwitter';
import BiCodeBlock from '@meronex/icons/bi/BiCodeBlock';
import MdcCloudAlert from '@meronex/icons/mdc/MdcCloudAlert';
import MdcCloudCheck from '@meronex/icons/mdc/MdcCloudCheck';
import MdcCloudSync from '@meronex/icons/mdc/MdcCloudSync';
import styled from 'polotno/utils/styled';

import { useProject } from '../project';

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { PostProcessButton } from './post-process-button';
import { UserMenu } from './user-menu';
import { CloudWarning } from '../cloud-warning';

const NavbarContainer = styled('div')`
  white-space: nowrap;

  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled('div')`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

const Status = observer(({ project }) => {
  const Icon = !project.cloudEnabled
    ? MdcCloudAlert
    : project.status === 'saved'
    ? MdcCloudCheck
    : MdcCloudSync;
  return (
    <Popover
      content={
        <div style={{ padding: '10px', maxWidth: '300px' }}>
          {!project.cloudEnabled && (
            <CloudWarning style={{ padding: '10px' }} />
          )}
          {project.cloudEnabled && project.status === 'saved' && (
            <>
              You data is saved with{' '}
              <a href="https://puter.com" target="_blank">
                Puter.com
              </a>
            </>
          )}
          {project.cloudEnabled &&
            (project.status === 'saving' || project.status === 'has-changes') &&
            'Saving...'}
        </div>
      }
      interactionKind="hover"
    >
      <div style={{ padding: '0 5px' }}>
        <Icon className="bp5-icon" style={{ fontSize: '25px', opacity: 0.8 }} />
      </div>
    </Popover>
  );
});

// Helpers for fullscreen and presentation
function enterFullscreen() {
  const el = document.getElementById('root'); // Vite root (wraps the editor)
  if (!el) return;
  if (el.requestFullscreen) el.requestFullscreen();
  document.body.classList.add('presenting');
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  document.body.classList.remove('presenting');
}

async function presentSlideshow(store) {
  // Export all pages as data URLs then open simple slideshow window
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write('<html><head><title>Presentation</title><style>body{margin:0;background:#111;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;}img{max-width:100%;max-height:100%;display:none;box-shadow:0 0 30px #000;}#hint{position:fixed;bottom:10px;left:50%;transform:translateX(-50%);color:#fff;font-size:12px;opacity:.6;}button{position:fixed;top:10px;right:10px;background:#222;color:#fff;border:1px solid #444;padding:6px 10px;border-radius:4px;cursor:pointer;}button:hover{background:#333;} </style></head><body><div id="hint">Arrow keys • F fullscreen • Esc exit</div><button id="closeBtn">Close</button></body></html>');
  const imgs = [];
  for (const page of store.pages) {
    const url = await store.toDataURL({ pageId: page.id });
    const img = win.document.createElement('img');
    img.src = url;
    win.document.body.appendChild(img);
    imgs.push(img);
  }
  let i = 0;
  function show(idx) {
    imgs.forEach(im => (im.style.display = 'none'));
    imgs[idx].style.display = 'block';
  }
  show(0);
  win.document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { i = (i + 1) % imgs.length; show(i); }
    if (e.key === 'ArrowLeft') { i = (i - 1 + imgs.length) % imgs.length; show(i); }
    if (e.key.toLowerCase() === 'f') { if (win.document.documentElement.requestFullscreen) win.document.documentElement.requestFullscreen(); }
  });
  win.document.getElementById('closeBtn').onclick = () => win.close();
}

export default observer(({ store }) => {
  const project = useProject();

  return (
    <NavbarContainer className="bp5-navbar topbar">
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <FileMenu store={store} project={project} />
          <div
            style={{
              paddingLeft: '20px',
              maxWidth: '200px',
            }}
          >
            <EditableText
              value={window.project.name}
              placeholder="Design name"
              onChange={(name) => {
                window.project.name = name;
                window.project.requestSave();
              }}
            />
          </div>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          {/* <Status project={project} /> */}

          {/* Removed 'For developers' button */}
          {/* 
          <AnchorButton
            minimal
            href="https://github.com/lavrton/polotno-studio"
            target="_blank"
            icon={
              <FaGithub className="bp5-icon" style={{ fontSize: '20px' }} />
            }
          ></AnchorButton>
          <AnchorButton
            minimal
            href="https://twitter.com/lavrton"
            target="_blank"
            icon={
              <FaTwitter className="bp5-icon" style={{ fontSize: '20px' }} />
            }
          ></AnchorButton> */}
          <NavbarDivider />
          {/* Fullscreen toggle */}
          <AnchorButton
            minimal
            onClick={() => {
              if (document.fullscreenElement) exitFullscreen(); else enterFullscreen();
            }}
          >
            {document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen'}
          </AnchorButton>
          {/* Present (slideshow) */}
          <AnchorButton
            minimal
            onClick={() => presentSlideshow(store)}
          >
            Present
          </AnchorButton>
          <PostProcessButton store={store} />
          <DownloadButton store={store} />
          <NavbarDivider />
          <AnchorButton
            minimal
            icon={<Icon icon={IconNames.HELP} />}
            onClick={() => {
              // Trigger tutorial
              const tutorialButton = document.querySelector('[data-tutorial-trigger]');
              if (tutorialButton) {
                tutorialButton.click();
              }
            }}
            title="Start Tutorial"
          >
            Help
          </AnchorButton>
          <UserMenu store={store} project={project} />
          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
