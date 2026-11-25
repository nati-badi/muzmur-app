const {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp,
} = require('firebase/firestore');
const { ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const { db, storage } = require('../config/firebase.config');

const SUBMISSIONS_COLLECTION = 'mezmur_submissions';

class SubmissionService {
  static submissionAudioPath(userId, submissionId, fileName = 'audio.m4a') {
    return `submissions/${userId}/${submissionId}/${fileName}`;
  }

  static async uploadSubmissionAudio(userId, submissionId, localUri, mimeType = 'audio/m4a') {
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const storageRef = ref(storage, this.submissionAudioPath(userId, submissionId));
      await uploadBytes(storageRef, blob, { contentType: mimeType });
      const downloadUrl = await getDownloadURL(storageRef);
      return {
        success: true,
        audioStoragePath: this.submissionAudioPath(userId, submissionId),
        audioDownloadUrl: downloadUrl,
      };
    } catch (error) {
      console.error('Error uploading submission audio:', error);
      return { success: false, error: error.message };
    }
  }

  static async createSubmission(user, payload, audioUri, audioMimeType) {
    if (!user?.uid || user.isAnonymous) {
      return { success: false, error: 'Sign in required' };
    }

    try {
      const baseDoc = {
        submittedBy: user.uid,
        submitterEmail: user.email || '',
        submitterName: user.displayName || '',
        title: payload.title,
        lyrics: payload.lyrics,
        translation: payload.translation || '',
        section: payload.section,
        notes: payload.notes || '',
        proposedId: payload.proposedId || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), baseDoc);

      if (audioUri) {
        const upload = await this.uploadSubmissionAudio(
          user.uid,
          docRef.id,
          audioUri,
          audioMimeType || 'audio/m4a'
        );
        if (!upload.success) {
          await updateDoc(docRef, {
            status: 'cancelled',
            updatedAt: serverTimestamp(),
          });
          return { success: false, error: upload.error };
        }
        await updateDoc(docRef, {
          audioStoragePath: upload.audioStoragePath,
          audioDownloadUrl: upload.audioDownloadUrl,
          updatedAt: serverTimestamp(),
        });
      }

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating submission:', error);
      return { success: false, error: error.message };
    }
  }

  static async getMySubmissions(userId) {
    try {
      const q = query(
        collection(db, SUBMISSIONS_COLLECTION),
        where('submittedBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach((snap) => items.push({ id: snap.id, ...snap.data() }));
      return { success: true, submissions: items };
    } catch (error) {
      console.error('Error fetching my submissions:', error);
      return { success: false, error: error.message };
    }
  }

  static async getSubmission(submissionId) {
    try {
      const snap = await getDoc(doc(db, SUBMISSIONS_COLLECTION, submissionId));
      if (!snap.exists()) {
        return { success: false, error: 'Not found' };
      }
      return { success: true, submission: { id: snap.id, ...snap.data() } };
    } catch (error) {
      console.error('Error getting submission:', error);
      return { success: false, error: error.message };
    }
  }

  static async cancelSubmission(userId, submissionId) {
    try {
      const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        return { success: false, error: 'Not found' };
      }
      const data = snap.data();
      if (data.submittedBy !== userId) {
        return { success: false, error: 'Not allowed' };
      }
      if (data.status !== 'pending') {
        return { success: false, error: 'Cannot cancel' };
      }

      if (data.audioStoragePath) {
        try {
          await deleteObject(ref(storage, data.audioStoragePath));
        } catch (e) {
          console.warn('Could not delete submission audio:', e);
        }
      }

      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error cancelling submission:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SubmissionService;