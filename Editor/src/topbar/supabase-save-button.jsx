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
<<<<<<< HEAD
import { deduplicateRequest } from '../utils/request-deduplication';
import { retrySupabaseOperation } from '../utils/retry-helper';
=======
>>>>>>> main

export const SupabaseSaveButton = observer(({ store, project }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [designName, setDesignName] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('math');
  const [selectedQuarter, setSelectedQuarter] = React.useState('1');
  const [selectedGradeLevel, setSelectedGradeLevel] = React.useState('');
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

  // Load grade level from Firebase/sessionStorage/URL on mount
  React.useEffect(() => {
    const loadGradeLevel = async () => {
      try {
        // Try to get from utility function
        const { getUserGradeLevelWithFallback } = await import('../utils/getUserGradeLevel');
        const gradeLevel = await getUserGradeLevelWithFallback();
        if (gradeLevel) {
          setSelectedGradeLevel(gradeLevel);
          console.log('✅ Auto-populated grade level:', gradeLevel);
        } else {
          // If not found, try to get from URL params
          const urlParams = new URLSearchParams(window.location.search);
          const urlGrade = urlParams.get('grade');
          if (urlGrade) {
            const normalizedGrade = urlGrade.startsWith('grade') ? urlGrade : `grade${urlGrade}`;
            setSelectedGradeLevel(normalizedGrade);
            console.log('✅ Got grade level from URL:', normalizedGrade);
          }
        }
      } catch (error) {
        console.warn('Could not auto-load grade level:', error);
      }
    };
    loadGradeLevel();
  }, []);

  // Load existing design metadata when editing
  React.useEffect(() => {
    if (project?.id) {
      try {
        const storedMetadata = sessionStorage.getItem('current-supabase-design');
        if (storedMetadata) {
          const metadata = JSON.parse(storedMetadata);
          console.log('📋 Loading design metadata:', metadata);
          setDesignName(metadata.name || project.name || generateDefaultName());
          if (metadata.subject) setSelectedSubject(metadata.subject);
          if (metadata.quarter) setSelectedQuarter(metadata.quarter);
          if (metadata.gradeLevel) setSelectedGradeLevel(metadata.gradeLevel);
        } else if (project.name) {
          setDesignName(project.name);
        }
      } catch (error) {
        console.error('Error loading design metadata:', error);
      }
    }
  }, [project?.id]);

  const handleSave = async () => {
    if (!designName.trim()) {
      setAlertMessage('Please enter a design name');
      setAlertIntent(Intent.DANGER);
      setShowAlert(true);
      return;
    }

    if (!selectedGradeLevel) {
      setAlertMessage('Please select a grade level');
      setAlertIntent(Intent.DANGER);
      setShowAlert(true);
      return;
    }

<<<<<<< HEAD
    // Prevent duplicate saves using deduplication
    const existingDesignId = project?.id || sessionStorage.getItem('supabase-design-id');
    const saveKey = `save-${existingDesignId || designName.trim()}-${selectedSubject}-${selectedQuarter}`;
    
    setIsSaving(true);
    
    try {
      // Use deduplication to prevent multiple simultaneous saves
      await deduplicateRequest(saveKey, async () => {
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

        // Save to Supabase with retry logic for network errors
        const isEditing = !!existingDesignId;
        
        const result = await retrySupabaseOperation(async () => {
          return await saveDesignBySubject({
            storeJSON: store.toJSON(),
            preview: blob,
            name: designName.trim(),
            subject: selectedSubject,
            quarter: selectedQuarter,
            gradeLevel: selectedGradeLevel,
            id: existingDesignId,
          });
        }, 'save design');

        setAlertMessage(
          `${isEditing ? '✅ Design updated successfully!' : '✨ New design created!'}\n\n📚 Subject: ${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}\n📅 Quarter: ${selectedQuarter}\n🏷️ Design Name: ${designName.trim()}\n🆔 Design ID: ${result.id}`
        );
        setAlertIntent(Intent.SUCCESS);
        setShowAlert(true);
        
        // Close dialog after success
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
        
        return result;
      });

=======
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

      // Save to Supabase (use existing ID if we're editing an existing design)
      const existingDesignId = project?.id || sessionStorage.getItem('supabase-design-id');
      const isEditing = !!existingDesignId;
      
      console.log(isEditing ? `🔄 Updating existing design: ${existingDesignId}` : '✨ Creating new design');
      console.log(`📚 Saving with grade level: ${selectedGradeLevel}`);
      
      const result = await saveDesignBySubject({
        storeJSON: store.toJSON(),
        preview: blob,
        name: designName.trim(),
        subject: selectedSubject,
        quarter: selectedQuarter,
        gradeLevel: selectedGradeLevel, // Pass grade level explicitly
        id: existingDesignId, // This will overwrite if provided
      });

      setAlertMessage(
        `${isEditing ? '✅ Design updated successfully!' : '✨ New design created!'}\n\n📚 Subject: ${selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}\n📅 Quarter: ${selectedQuarter}\n🏷️ Design Name: ${designName.trim()}\n🆔 Design ID: ${result.id}`
      );
      setAlertIntent(Intent.SUCCESS);
      setShowAlert(true);
      
      // Close dialog after success
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);

>>>>>>> main
    } catch (error) {
      console.error('Save failed:', error);
      
      // Format error message for better display
      let errorMessage = error.message || 'Unknown error occurred';
      
      // Check if it's a size limit error for design JSON
      if (error.message && (error.message.includes('too large') || error.message.includes('50MB') || error.message.includes('embedded media'))) {
<<<<<<< HEAD
=======
        // Format the error message with line breaks for better readability
>>>>>>> main
        errorMessage = error.message.replace(/\n/g, '\n');
      }
      
      setAlertMessage(`❌ Save failed:\n\n${errorMessage}`);
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
              <strong>Ready to use:</strong> Enter a design name, select subject, quarter, and grade level, then click "Upload to Cloud"!
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
        text="Upload to Cloud"
        intent="primary"
        onClick={() => setIsOpen(true)}
        style={{ marginLeft: '8px' }}
      />
      
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Upload Design to Cloud"
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

          <FormGroup label="Grade Level" labelFor="grade-select" requiredLabel>
            <select
              id="grade-select"
              value={selectedGradeLevel}
              onChange={(e) => setSelectedGradeLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              required
            >
              <option value="">-- Select Grade Level --</option>
              <option value="grade5">Grade 5</option>
              <option value="grade6">Grade 6</option>
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
              text="Upload to Cloud"
              intent="primary"
              loading={isSaving}
              onClick={handleSave}
              disabled={!designName.trim() || !selectedGradeLevel}
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

