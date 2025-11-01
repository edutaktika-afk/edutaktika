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
// Firebase configuration (using existing project config)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB5BbeLLvPX8l1c4Lq0f-CmIUml4hQOQlE",
  authDomain: "edutaktika.firebaseapp.com",
  databaseURL: "https://edutaktika-default-rtdb.firebaseio.com",
  projectId: "edutaktika",
  storageBucket: "edutaktika.appspot.com",
  messagingSenderId: "676848575316",
  appId: "1:676848575316:web:f78f8c0f83bf3d9dfb5ec1",
  measurementId: "G-X3GT5TNN87"
};

// Database path where designs will be saved
const DATABASE_PATH = "designs";

// Function to clean undefined values from JSON data
const cleanUndefinedValues = (obj) => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = cleanUndefinedValues(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }
  
  return obj;
};

export const FirebaseSaveButton = observer(({ store, project }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [designName, setDesignName] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('math');
  const [selectedQuarter, setSelectedQuarter] = React.useState('1');
  const [showAlert, setShowAlert] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertIntent, setAlertIntent] = React.useState(Intent.SUCCESS);
  const [uploadedUrls, setUploadedUrls] = React.useState({ databaseUrl: '', designId: '' });

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
      // Initialize Firebase (using v8 approach like the rest of your codebase)
      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      const db = firebase.database();
      
      const fileName = designName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
      const timestamp = Date.now();
      const designId = `${fileName}-${timestamp}`;
      
      // Prepare JSON data and clean undefined values
      const jsonData = store.toJSON();
      const cleanedJsonData = cleanUndefinedValues(jsonData);
      
      // Generate thumbnail (PNG) and convert to base64
      const thumbnailUrl = await store.toDataURL({ 
        pageId: store.pages[0]?.id,
        pixelRatio: 0.5,
        mimeType: 'image/png'
      });
      
      // Create design object for database
      const designData = {
        id: designId,
        name: designName.trim(),
        json: cleanedJsonData,
        thumbnail: thumbnailUrl,
        createdAt: timestamp,
        createdBy: 'teacher', // You can add user authentication later
        version: '1.0',
        subject: selectedSubject,
        quarter: selectedQuarter,
        description: `Design for ${selectedSubject} Quarter ${selectedQuarter}`
      };
      
      // Save to Realtime Database
      await db.ref(`${DATABASE_PATH}/${designId}`).set(designData);
      
      // Create a direct URL to the design
      const databaseUrl = `${FIREBASE_CONFIG.databaseURL}/${DATABASE_PATH}/${designId}.json`;
      
      setUploadedUrls({ databaseUrl, designId });
      setAlertMessage(`Design saved successfully!\n\n📚 Subject: ${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}\n📅 Quarter: ${selectedQuarter}\n🔗 Database URL: ${databaseUrl}`);
      setAlertIntent(Intent.SUCCESS);
      setShowAlert(true);
      
    } catch (error) {
      console.error('Save failed:', error);
      setAlertMessage(`Save failed: ${error.message}`);
      setAlertIntent(Intent.DANGER);
      setShowAlert(true);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setAlertMessage('URL copied to clipboard!');
      setAlertIntent(Intent.SUCCESS);
      setShowAlert(true);
    });
  };

  const openGallery = () => {
    window.open('../gallery.html', '_blank');
  };

  return (
    <>
      <Button
        icon={<CloudUpload />}
        text="Save Design"
        intent="primary"
        onClick={() => setIsOpen(true)}
        style={{ marginLeft: '8px' }}
      />
      
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Save Design to Firebase"
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
              <option value="math">Math</option>
              <option value="english">English</option>
              <option value="science">Science</option>
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
          
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
            <h4>✅ Firebase Ready!</h4>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Firebase is already configured and ready to use. Your designs will be saved to the existing Firebase Realtime Database.
            </p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              <strong>Current config:</strong><br />
              Project: edutaktika<br />
              Database: https://edutaktika-default-rtdb.firebaseio.com<br />
              Path: designs/
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <strong>Ready to use:</strong> Just enter a design name and click "Save to Firebase"!
            </div>
          </div>
          
          {uploadedUrls.databaseUrl && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
              <h4>Design Saved Successfully!</h4>
              <div style={{ marginBottom: '10px' }}>
                <p><strong>📚 Subject:</strong> {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}</p>
                <p><strong>📅 Quarter:</strong> {selectedQuarter}</p>
                <p><strong>🏷️ Design Name:</strong> {designName}</p>
              </div>
              <p><strong>Database URL:</strong></p>
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <InputGroup
                  value={uploadedUrls.databaseUrl}
                  readOnly
                  style={{ flex: 1 }}
                />
                <Button
                  text="Copy"
                  onClick={() => copyToClipboard(uploadedUrls.databaseUrl)}
                  small
                />
              </div>
              <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                <strong>Design ID:</strong> {uploadedUrls.designId}
              </p>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <Button
                  text="View in Gallery"
                  intent="primary"
                  onClick={openGallery}
                />
                <Button
                  text="Close"
                  onClick={() => setIsOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              text="Cancel"
              onClick={() => setIsOpen(false)}
            />
            <Button
              text="Save to Firebase"
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
