import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Dialog,
  Classes,
  FormGroup,
  InputGroup,
  Intent,
  Alert,
  Spinner,
} from '@blueprintjs/core';
import { CloudUpload } from '@blueprintjs/icons';
import FaCheckCircle from '@meronex/icons/fa/FaCheckCircle';
import FaTimesCircle from '@meronex/icons/fa/FaTimesCircle';
import { saveDesignBySubject, listDesignsBySubject } from '../supabase-api';
import { shouldUseSupabase } from '../supabase';

export const SupabaseSaveButton = observer(({ store }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [designName, setDesignName] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('math');
  const [selectedQuarter, setSelectedQuarter] = React.useState('1');
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertIntent, setAlertIntent] = React.useState(Intent.SUCCESS);
  const [connectionStatus, setConnectionStatus] = React.useState('checking');

  // Check connection status on mount
  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const list = await listDesignsBySubject('math');
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Supabase connection check failed:', error);
        setConnectionStatus('disconnected');
      }
    };
    checkConnection();
  }, []);

  // Generate default name from design content
  const generateDefaultName = () => {
    const texts = [];
    store.pages.forEach((p) => {
      p.children.forEach((c) => {
        if (c.type === 'text') {
          texts.push(c.text);
        }
      });
    });
    const allWords = texts.join(' ').split(' ');
    const words = allWords.slice(0, 3);
    return words.join(' ').replace(/\s/g, '-').toLowerCase() || 'design';
  };

  React.useEffect(() => {
    if (!designName) {
      setDesignName(generateDefaultName());
    }
  }, [store.pages]);

  const handleSave = async () => {
    if (!designName.trim()) {
      setAlertMessage('Please enter a design name');
      setAlertIntent(Intent.DANGER);
      setShowAlert(true);
      return;
    }

    setIsSaving(true);
    try {
      // Generate thumbnail preview
      const canvas = store.pages.length
        ? await store._toCanvas({
            pixelRatio: 200 / store.activePage?.computedWidth,
            pageId: store.activePage?.id,
            quickMode: true,
            _skipTimeout: true,
          })
        : document.createElement('canvas');
      
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      // Save to Supabase
      const result = await saveDesignBySubject({
        storeJSON: store.toJSON(),
        preview: blob,
        name: designName.trim(),
        subject: selectedSubject,
        quarter: selectedQuarter,
      });

      setAlertMessage(
        `Design saved successfully!\n\n📚 Subject: ${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}\n📅 Quarter: ${selectedQuarter}\n🏷️ Design Name: ${designName.trim()}\n🆔 Design ID: ${result.id}`
      );
      setAlertIntent(Intent.SUCCESS);
      setShowAlert(true);
      
      // Close dialog after success
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);

    } catch (error) {
      console.error('Save failed:', error);
      setAlertMessage(`Save failed: ${error.message}`);
      setAlertIntent(Intent.DANGER);
      setShowAlert(true);
    } finally {
      setIsSaving(false);
    }
  };

  const ConnectionIndicator = () => {
    const connected = connectionStatus === 'connected' && shouldUseSupabase();
    
    return (
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: connected ? '#e8f5e8' : '#ffe0e0', borderRadius: '5px' }}>
        <h4>
          {connected ? (
            <>
              <FaCheckCircle style={{ marginRight: '8px', color: '#2ecc71' }} size={20} />
              Supabase Connected!
            </>
          ) : connectionStatus === 'checking' ? (
            <>
              <Spinner size={16} style={{ display: 'inline-block', marginRight: '8px' }} />
              Checking Connection...
            </>
          ) : (
            <>
              <FaTimesCircle style={{ marginRight: '8px', color: '#e74c3c' }} size={20} />
              Supabase Disconnected
            </>
          )}
        </h4>
        {connected ? (
          <>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Your designs will be saved to Supabase Storage in the <strong>LessonStorage</strong> bucket.
            </p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              <strong>Current config:</strong><br />
              Project: liiwqyodlzivzzethyrj<br />
              Bucket: LessonStorage<br />
              Folders: SCIENCE, ENGLISH, MATH
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <strong>Ready to use:</strong> Just enter a design name and click "Save to Supabase"!
            </div>
          </>
        ) : connectionStatus === 'disconnected' ? (
          <>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              The system will fall back to local storage if Supabase is unavailable.
            </p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              Check your Supabase configuration in <code>src/supabase.js</code>
            </div>
          </>
        ) : (
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Verifying connection to Supabase...
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <Button
        icon={<CloudUpload />}
        text="Save to Supabase"
        intent="primary"
        onClick={() => setIsOpen(true)}
        style={{ marginLeft: '8px' }}
      />
      
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Save Design to Supabase"
        style={{ width: '500px' }}
      >
        <div className={Classes.DIALOG_BODY}>
          <FormGroup label="Design Name" labelFor="design-name">
            <InputGroup
              id="design-name"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Enter design name"
            />
          </FormGroup>
          
          <FormGroup label="Subject" labelFor="subject-select">
            <select
              id="subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="math">Math</option>
            </select>
          </FormGroup>
          
          <FormGroup label="Quarter" labelFor="quarter-select">
            <select
              id="quarter-select"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="1">Quarter 1</option>
              <option value="2">Quarter 2</option>
              <option value="3">Quarter 3</option>
              <option value="4">Quarter 4</option>
            </select>
          </FormGroup>

          <ConnectionIndicator />
        </div>
        
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              text="Cancel"
              onClick={() => setIsOpen(false)}
            />
            <Button
              text="Save to Supabase"
              intent="primary"
              loading={isSaving}
              onClick={handleSave}
              disabled={!designName.trim()}
            />
          </div>
        </div>
      </Dialog>
      
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        intent={alertIntent}
        confirmButtonText="OK"
      >
        {alertMessage}
      </Alert>
    </>
  );
});

