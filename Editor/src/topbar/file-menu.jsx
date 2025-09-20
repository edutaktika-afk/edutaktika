import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Position, Menu, MenuItem, MenuDivider, Popover } from '@blueprintjs/core';
import { Plus, Translate, FolderOpen, FloppyDisk, Import, AlignJustify, Home } from '@blueprintjs/icons';
import { downloadFile } from 'polotno/utils/download';
import { svgToJson } from 'polotno/utils/from-svg';

export const FileMenu = observer(({ store, project }) => {
  const inputRef = React.useRef();
  return (
    <>
      <Popover
        content={
          <Menu>
            {/* <MenuDivider title={t('toolbar.layering')} /> */}
            <MenuItem
              icon={<Plus />}
              text="Create new design"
              onClick={() => {
                project.createNewDesign();
              }}
            />
            <MenuDivider />
            <MenuItem
              icon={<FolderOpen />}
              text="Open"
              onClick={() => {
                document.querySelector('#load-project').click();
              }}
            />
            <MenuItem
              icon={<Import />}
              text="Import svg (experimental)"
              onClick={() => {
                document.querySelector('#svg-import-input').click();
              }}
            />
            <MenuItem
              icon={<FloppyDisk />}
              text="Save as JSON"
              onClick={() => {
                const json = store.toJSON();

                const url =
                  'data:text/json;base64,' +
                  window.btoa(
                    unescape(encodeURIComponent(JSON.stringify(json)))
                  );

                downloadFile(url, 'polotno.json');
              }}
            />

            <MenuDivider />
            <MenuItem text="Language" icon={<Translate />}>
              <MenuItem
                text="English"
                active={project.language.startsWith('en')}
                onClick={() => {
                  project.setLanguage('en');
                }}
              />
              <MenuItem
                text="Portuguese"
                active={project.language.startsWith('pt')}
                onClick={() => {
                  project.setLanguage('pt');
                }}
              />
              <MenuItem
                text="French"
                active={project.language.startsWith('fr')}
                onClick={() => {
                  project.setLanguage('fr');
                }}
              />
              <MenuItem
                text="Russian"
                active={project.language.startsWith('ru')}
                onClick={() => {
                  project.setLanguage('ru');
                }}
              />
              <MenuItem
                text="Indonesian"
                active={project.language.startsWith('id')}
                onClick={() => {
                  project.setLanguage('id');
                }}
              />
            </MenuItem>
            <MenuItem
              text="Home"
              icon={<Home />}
              onClick={() => {
                // Navigate back to the application's homepage
                // Handle both local development and Netlify deployment paths
                const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const isNetlify = window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com');
                const isEditorPath = window.location.pathname.includes('/editor/');
                
                let homePath;
                if (isLocalDev) {
                  // Local development: Editor runs on localhost:5173, homepage is at localhost:5500
                  homePath = 'http://127.0.0.1:5500/Teacher/homepage.html';
                } else if (isNetlify || isEditorPath) {
                  // Netlify deployment: Editor is in /editor/ subfolder, homepage is at root
                  homePath = '/Teacher/homepage.html';
                } else {
                  // Fallback: assume relative path
                  homePath = '../Teacher/homepage.html';
                }
                
                window.location.replace(homePath);
              }}
            />
          </Menu>
        }
        position={Position.BOTTOM_RIGHT}
      >
        <Button minimal icon={<AlignJustify />} />
      </Popover>
      <input
        type="file"
        id="load-project"
        accept=".json,.polotno"
        ref={inputRef}
        style={{ width: '180px', display: 'none' }}
        onChange={(e) => {
          var input = e.target;

          if (!input.files.length) {
            return;
          }

          var reader = new FileReader();
          reader.onloadend = async function () {
            var text = reader.result;
            let json;
            try {
              json = JSON.parse(text);
            } catch (e) {
              alert('Can not load the project.');
            }

            const errors = store.validate(json);
            if (errors.length > 0) {
              alert('Can not load the project. See console for details.');
              console.error(errors);
              return;
            }

            if (json) {
              await project.createNewDesign();
              store.loadJSON(json);
              project.save();
              input.value = '';
            }
          };
          reader.onerror = function () {
            alert('Can not load the project.');
          };
          reader.readAsText(input.files[0]);
        }}
      />
      <input
        type="file"
        id="svg-import-input"
        accept=".svg"
        ref={inputRef}
        style={{ width: '180px', display: 'none' }}
        onChange={(e) => {
          var input = e.target;

          if (!input.files.length) {
            return;
          }

          var reader = new FileReader();
          reader.onloadend = async function () {
            var text = reader.result;
            let json;
            try {
              json = await svgToJson(text);
            } catch (e) {
              alert('Can not load the project.');
            }

            const errors = store.validate(json);
            if (errors.length > 0) {
              alert('Can not load the project. See console for details.');
              console.error(errors);
              return;
            }

            if (json) {
              await project.createNewDesign();
              store.loadJSON(json);
              project.save();
              input.value = '';
            }
          };
          reader.onerror = function () {
            alert('Can not load the project.');
          };
          reader.readAsText(input.files[0]);
        }}
      />
      {/* Removed About dialog; Home now navigates directly to the app homepage */}
    </>
  );
});
